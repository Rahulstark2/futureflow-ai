import { LLMProvider } from "./provider";
import { GeminiProvider } from "./geminiProvider";

export * from "./provider";
export * from "./geminiProvider";

let defaultProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!defaultProvider) {
    defaultProvider = new GeminiProvider();
  }
  return defaultProvider;
}
