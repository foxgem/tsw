export type NanoApi = "languageModel" | "summarizer" | "writer" | "rewriter";

export type LMOptions = {
  topK?: number;
  temperature?: number;
  systemPrompt?: string;
};

export type SummarizerOptions = {
  sharedContext?: string;
  type?: "tl;dr" | "key-points" | "teaser" | "headline";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
};

export type WriterOptions = {
  sharedContext?: string;
  tone?: "formal" | "neutral" | "casual";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
};

export type RewriterOptions = {
  sharedContext?: string;
  tone?: "as-is" | "more-formal" | "more-casual";
  format?: "as-is" | "plain-text" | "markdown";
  length?: "as-is" | "shorter" | "longer";
};

export type Command = {
  name: string;
  nano: NanoApi;
  options: LMOptions | SummarizerOptions | WriterOptions | RewriterOptions;
};
