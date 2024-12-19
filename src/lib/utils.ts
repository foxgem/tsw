import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  DEFAULT_MODEL_PROVIDER,
  MODELS,
  type ModelProvider,
} from "~utils/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function upperCaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getProviderFromModel(model: string) {
  for (const [provider, models] of Object.entries(MODELS)) {
    if (models.includes(model)) {
      return provider as ModelProvider;
    }
  }
  return DEFAULT_MODEL_PROVIDER;
}

export const formatMessageContent = (content: string | object) => {
  return typeof content === "object"
    ? `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``
    : content;
};
