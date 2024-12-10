export const TIMER_COUNT_LIMIT = 3;

export const TAB_CSS =
  "data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold data-[state=active]:rounded-t data-[state=active]:border data-[state=active]:border-b-0";

export const TABCONTENT_CSS =
  "border p-5 mt-0 h-[267px] overflow-scroll rounded-b rounded-tr";

export const GITHUB_ROOT = "https://github.com/foxgem/tsw";

export const LANG_LIST = [
  "Java",
  "Javascript",
  "Typescript",
  "Rust",
  "Python",
  "Go",
  "Svelte",
  "React",
  "Ionic",
  "Angular",
  "Soldity",
];

export const DEFAULT_MODEL = "gemini-1.5-flash";
export const MODELS = {
  gemini: [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-exp-1206",
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
  ],
};
export const IINSTANT_INPUT_COUNT_LIMIT = 10;
export const INSTANT_INPUT_MAX_LENGTH = 200;
