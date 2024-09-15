import { Storage } from "@plasmohq/storage";

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

export async function readTimerForDomain(domain: string): Promise<TimerForDomain | null> {
  const time = await storage.get<number>(domain);
  return time !== undefined ? { domain, time } : null;
}

export async function deleteTimerForDomain(domain: string) {
  await storage.remove(domain);
}

export async function getAllTimersForDomains(): Promise<TimerForDomain[]> {
  const allItems = await storage.getAll();
  return Object.entries(allItems).map(([domain, time]) => ({
    domain,
    time: Number(time),
  }));
}
