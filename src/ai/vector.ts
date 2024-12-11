import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { loadApiKey, turndown } from "./utils";
import { cosineSimilarity, embed, embedMany, type Embedding } from "ai";

// Use Gemini to embed text into vectors
export class MemVector {
  apiKey: string;
  rawHtml: string;
  cleanedMarkdown: string;
  store: Array<{
    text: string;
    embedding: Embedding;
  }>;

  constructor(rawHtml: string) {
    this.rawHtml = rawHtml;
    loadApiKey("gemini").then((apiKey) => {
      this.apiKey = apiKey;
    });
  }

  async split() {
    const markdown = turndown(this.rawHtml);
    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage(
      "markdown",
      {
        chunkSize: 4096,
        chunkOverlap: 100,
      },
    );
    return await textSplitter.splitText(markdown);
  }

  async embed(value: string[] | string) {
    const google = createGoogleGenerativeAI({ apiKey: this.apiKey });
    const model = google.textEmbeddingModel("text-embedding-004", {
      outputDimensionality: 512,
    });

    if (Array.isArray(value)) {
      return (await embedMany({ model, values: value })).embeddings;
    }

    return [(await embed({ model, value })).embedding];
  }

  async indexing() {
    const values = await this.split();
    const embeddings = await this.embed(values);
    this.store = [];
    values.forEach((text, i) => {
      this.store.push({
        text,
        embedding: embeddings[i],
      });
    });
  }

  async search(query: string) {
    const embedding = (await this.embed(query))[0];
    const similarities = this.store.map((item) => {
      return {
        text: item.text,
        similarity: cosineSimilarity(embedding, item.embedding),
      };
    });

    return similarities
      .filter((item) => item.similarity > 0.5)
      .map((item) => item.text);
  }
}
