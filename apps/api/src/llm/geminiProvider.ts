import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { LLMProvider } from "./provider";

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;
  private model: string;
  private maxRetries: number;

  constructor(apiKey?: string, model?: string, maxRetries: number = 3) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: key });
    let resolvedModel = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.model = resolvedModel;
    this.maxRetries = maxRetries;
  }

  private cleanJsonText(raw: string): string {
    let text = raw.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return text.trim();
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemInstruction?: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let currentPrompt = prompt;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: currentPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Empty response from Gemini API.");
        }

        const text = this.cleanJsonText(rawText);
        let parsedJson: any;

        try {
          parsedJson = JSON.parse(text);
        } catch (parseErr) {
          throw new Error(`Failed to parse raw JSON from Gemini: ${(parseErr as Error).message}\nRaw text:\n${text}`);
        }

        // 1. Try parsing directly
        const directResult = schema.safeParse(parsedJson);
        if (directResult.success) {
          return directResult.data;
        }

        // 2. If Gemini returned a bare array [...], try wrapping into common object wrapper keys
        if (Array.isArray(parsedJson)) {
          const wrapperKeys = [
            "opportunities",
            "activities",
            "futureActivities",
            "problems",
            "benefits",
            "items",
            "data",
            "result",
          ];

          for (const key of wrapperKeys) {
            const wrapped = { [key]: parsedJson };
            const wrappedResult = schema.safeParse(wrapped);
            if (wrappedResult.success) {
              return wrappedResult.data;
            }
          }
        }

        // 3. If Gemini returned an object with an array under another key (e.g. { data: [...] }), try unwrapping
        if (typeof parsedJson === "object" && parsedJson !== null && !Array.isArray(parsedJson)) {
          const values = Object.values(parsedJson);
          if (values.length === 1 && Array.isArray(values[0])) {
            const unwrappedArray = values[0];
            // Try as bare array
            const bareResult = schema.safeParse(unwrappedArray);
            if (bareResult.success) {
              return bareResult.data;
            }

            // Try wrapping with standard keys
            const wrapperKeys = [
              "opportunities",
              "activities",
              "futureActivities",
              "problems",
              "benefits",
            ];
            for (const key of wrapperKeys) {
              const rewrapped = { [key]: unwrappedArray };
              const rewrapResult = schema.safeParse(rewrapped);
              if (rewrapResult.success) {
                return rewrapResult.data;
              }
            }
          }
        }

        // If direct parse failed and wrapping failed, throw to trigger retry
        throw new Error(
          `Validation failed: ${directResult.error.message}\nRaw output: ${text}`
        );
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiProvider] Attempt ${attempt}/${this.maxRetries} failed: ${err.message}`);

        if (attempt < this.maxRetries) {
          // Provide validation error feedback to Gemini in next attempt prompt
          currentPrompt = `${prompt}\n\nIMPORTANT: Previous response failed schema validation with error:\n${err.message}\nPlease return valid JSON strictly conforming to the requested schema.`;
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        }
      }
    }

    throw new Error(
      `Failed to parse/validate Gemini response after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }
}
