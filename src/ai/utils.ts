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

  // Keep only article content if found
  const articles = temp.querySelectorAll(
    "article:has(:is(h1, h2)), section:has(:is(h1, h2)), main",
  );

  if (articles.length > 0) {
    const mainDiv = document.createElement("div");
    for (const article of articles) {
      mainDiv.appendChild(article);
    }
    temp.innerHTML = mainDiv.innerHTML;
  }

  // Remove unwanted elements
  for (const el of temp.querySelectorAll(
    `script, style, form, audio, video, iframe, picture, img${
      selector ? `, ${selector}` : ""
    }`,
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
