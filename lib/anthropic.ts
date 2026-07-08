import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client
const globalForAnthropic = globalThis as unknown as { anthropic?: Anthropic };

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}
