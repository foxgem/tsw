import { tool } from "ai";
import { z } from "zod";

export function createGoogleSearch(setting: { apiKey: string; cx: string }) {
  return tool({
    description: "A tool for searching the web with Google",
    parameters: z.object({
      query: z
        .string()
        .describe("the string for searching the web with Google"),
    }),
    execute: async ({ query }) => {
      return searchGoogle(setting.apiKey, setting.cx, query);
    },
  });
}

async function searchGoogle(apiKey: string, cx: string, query: string) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => {
      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      };
    });
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
