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

function cleanPageText(root: HTMLElement, selector = "") {
  const temp = root.cloneNode(true) as HTMLElement;
  for (const el of temp.querySelectorAll(
    `script, style, form, audio, video, iframe, picture, img${selector ? `, ${selector}` : ""}`,
  )) {
    el.remove();
  }

  return temp.innerHTML.replace(/\s+/g, " ").trim();
}

export function turndown(root: HTMLElement, selector = "") {
  const html = cleanPageText(root, selector);
  const turndownService = new TurndownService();
  return turndownService.turndown(html);
}
