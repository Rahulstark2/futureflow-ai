import { z } from "zod";

export interface LLMProvider {
  /**
   * Generates a structured JSON response from LLM and validates it against the provided Zod schema.
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemInstruction?: string
  ): Promise<T>;
}
