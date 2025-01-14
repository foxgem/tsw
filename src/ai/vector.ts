import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { type Embedding, cosineSimilarity, embed, embedMany } from "ai";
import { loadApiKey, turndown } from "./utils";
import MiniSearch from "minisearch";

// Use Gemini to embed text into vectors
export class MemVector {
  apiKey: string;
  htmlRoot: HTMLElement;
  cleanedMarkdown: string;
  store: Array<{
    text: string;
    embedding: Embedding;
  }>;
  miniSearch: MiniSearch;

  constructor(htmlRoot: HTMLElement) {
    this.htmlRoot = htmlRoot;
    loadApiKey("gemini").then((apiKey) => {
      this.apiKey = apiKey;
    });
  }

  async split() {
    const markdown = turndown(this.htmlRoot);
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
      outputDimensionality: 256,
    });

    if (Array.isArray(value)) {
      return (await embedMany({ model, values: value })).embeddings;
    }

    return [(await embed({ model, value })).embedding];
  }

  async indexingWithEmbedding(values: string[]) {
    const embeddings = await this.embed(values);
    this.store = [];
    values.forEach((text, i) => {
      this.store.push({
        text,
        embedding: embeddings[i],
      });
    });
  }

  indexingWithStrings(values: string[]) {
    const documents = values.map((item, index) => ({ id: index, text: item }));
    this.miniSearch = new MiniSearch({
      fields: ["text"],
      storeFields: ["text"],
    });
    this.miniSearch.addAll(documents);
  }

  async indexing() {
    const values = await this.split();
    await this.indexingWithEmbedding(values);
    this.indexingWithStrings(values);
  }

  async searchWithEmbedding(query: string) {
    const embedding = (await this.embed(query))[0];
    const similarities = this.store.map((item) => {
      return {
        text: item.text,
        similarity: cosineSimilarity(embedding, item.embedding),
      };
    });

    return similarities
      .filter((item) => item.similarity > 0.9)
      .map((item) => item.text);
  }

  fuzzySearch(query: string) {
    const result = this.miniSearch
      .search(query, { prefix: true, fuzzy: 0.2 })
      .map((item) => item.text);
    return result[0] || "";
  }

  async search(query: string) {
    const results = await this.searchWithEmbedding(query);
    if (results.length) {
      return results;
    }

    console.log("Fuzzy search");

    return [this.fuzzySearch(query)];
  }
}
