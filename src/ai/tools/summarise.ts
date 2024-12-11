import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";
import { loadApiKey, turndown } from "~ai/utils";

// Use Gemini to summarise text because it is good at the long content
export function createSummarizer(html: string) {
  return tool({
    description: "A tool for summarising.",
    parameters: z.object({}),
    execute: async () => {
      const system =
        "You are good at summarising articles. Your summary is interesting and informative.";
      const cleanedMarkdown = turndown(html, ["code"]);
      const prompt = `Summarise the following article and output as below:
        1. a summary with 2 ~ 3 sentences.
        2. a list of key points.
        3. a list of keywords.

        Article:
        ${cleanedMarkdown}`;

      const apiKey = await loadApiKey("gemini");
      const google = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system,
        prompt,
      });
      return text;
    },
  });
}
