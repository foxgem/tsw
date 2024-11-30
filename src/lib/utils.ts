import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Command } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upperCaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function loadCommandsFromStorage(
  category: string,
): Promise<Command[]> {
  try {
    const result = await chrome.storage.local.get(category);
    return result[category] || [];
  } catch (error) {
    console.error("Error loading commands:", error);
    return [];
  }
}
