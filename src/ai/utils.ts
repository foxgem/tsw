import TurndownService from "turndown";
import { readApiKeys } from "~utils/storage";

export async function loadApiKey(provider: "gemini" | "groq") {
  let apiKey: string;

  if (provider === "gemini") {
    apiKey =
      process.env.PLASMO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY ||
      (await readApiKeys()).find((k) => k.name === "Gemini API")?.key;
  } else if (provider === "groq") {
    apiKey =
      process.env.PLASMO_PUBLIC_GROQ_API_KEY ||
      (await readApiKeys()).find((k) => k.name === "Groq API")?.key;
  }

  if (!apiKey) {
    throw new Error(
      `The Api key for ${provider} not found in environment variables or storage`,
    );
  }

  return apiKey;
}

export function turndown(html: string, filter: TurndownService.TagName[] = []) {
  const turndownService = new TurndownService().remove([
    "script",
    "style",
    "img",
    ...filter,
  ]);
  return turndownService.turndown(html);
}
