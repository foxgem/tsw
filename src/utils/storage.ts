import { Storage } from "@plasmohq/storage";
import { z } from "zod";

const storage = new Storage();

export const timerStartedMap = new Map<number, boolean>();

// For debugging
setInterval(async () => {
  console.log(timerStartedMap);
  console.log(await storage.getAll());
}, 3000);

export async function initDb() {
  const gemini = await storage.get("apiKey");
  const apiKyes = await storage.get<ApiKeyEntry[]>("apiKeys");

  if (!apiKyes || (apiKyes && apiKyes.length === 0)) {
    const defaultKeys = [
      { name: "Gemini API", key: gemini || "" },
      { name: "Neon DB URL", key: "" },
    ];
    await storage.set("apiKeys", defaultKeys);
  }

  if (gemini) {
    await storage.remove("apiKey");
  }
}

export type TimerForDomain = {
  domain: string;
  time: number;
};

export type ApiKeyEntry = {
  name: string;
  key: string;
};

export type QuickPrompt = {
  name: string;
  system: string;
  prompt: string;
};

export async function readInstantInputs() {
  return await storage.get<string[]>("instantInputs");
}

export async function upsertInstantInputs(instantInputs: string[]) {
  await storage.set("instantInputs", instantInputs);
}

export async function readQuickPrompts() {
  return await storage.get<QuickPrompt[]>("quickPrompts");
}

export async function upsertQuickPrompts(quickPrompts: QuickPrompt[]) {
  await storage.set("quickPrompts", quickPrompts);
}

export async function readApiKeys() {
  return await storage.get<ApiKeyEntry[]>("apiKeys");
}

export async function upsertApiKeys(apiKeyEntrys: ApiKeyEntry[]) {
  await storage.set("apiKeys", apiKeyEntrys);
}

export async function upsertTimerForDomain(timerForDomain: TimerForDomain) {
  await storage.set(timerForDomain.domain, timerForDomain.time);
}

export async function readTimerForDomain(
  domain: string,
): Promise<TimerForDomain | null> {
  const time = await storage.get<number>(domain);
  return time !== undefined ? { domain, time } : null;
}

export async function deleteTimerForDomain(domain: string) {
  await storage.remove(domain);
}

export async function getAllTimersForDomains(): Promise<TimerForDomain[]> {
  const allItems = await storage.getAll();
  return Object.entries(allItems)
    .filter(
      ([key]) => !["apiKeys", "quickPrompts", "instantInputs"].includes(key),
    )
    .map(([domain, time]) => ({
      domain,
      time: Number(time),
    }));
}

export const timerSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain required.")
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  time: z.number().min(10, "Too short").max(3600, "Too long"),
});
