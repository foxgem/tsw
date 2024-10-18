import { Storage } from "@plasmohq/storage";
import { z } from "zod";

const storage = new Storage();

export const timerStartedMap = new Map<number, boolean>();

// For debugging
setInterval(async () => {
  console.log(await chrome.storage.local.get());
  console.log(timerStartedMap);
  console.log(await storage.getAll());
}, 3000);

export type TimerForDomain = {
  domain: string;
  time: number;
};

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
    .filter(([key]) => key !== "apiKey")
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
  time: z.number().min(10, "too short").max(3600, "too long"),
});
