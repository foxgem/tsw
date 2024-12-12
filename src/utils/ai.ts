import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import {
  type CoreAssistantMessage,
  type CoreMessage,
  type CoreSystemMessage,
  type CoreToolMessage,
  type CoreUserMessage,
  streamText,
} from "ai";
import React from "react";
import { createRoot } from "react-dom/client";
import { StreamMessage } from "~/components/StreamMessage";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_PROVIDER,
  MODEL_PROVIDERS,
  type ModelProvider,
} from "./constants";
import { loadApiKey, turndown } from "~ai/utils";
import { MemVector } from "~ai/vector";

const siEnglishTeacher =
  "你是一名资深英语老师有丰富的教学经验，可以深入浅出的用中文讲解英文疑难杂句和单词释义。";
const siSummariser =
  "You are good at summarising articles. Your summary is interesting and informative.  ";

const siCodeExpert = `
  You are a coding expert. You are good at:
  1. Explaining code snippets.
  2. Rewriting an existing code snippet into a new code snippet with a specified programming language.
  3. Explaining the reason of the given error messages.`;

const ocrExpert = (postProcessing: string) => {
  const ocrPrompt = `
  OCR this image. Extract the text as it is, without analyzing or summarizing. If there is post-processing, apply it after OCR.

  Before OCR, consider the following pre-processing steps:
  1. **Noise reduction:** Apply Gaussian blur with a sigma of 1.5 to reduce noise.
  2. **Binarization:** Use adaptive thresholding with a block size of 11 and C=2 to convert the image to black and white.
  3. **Deskewing:** Correct the image tilt using OpenCV's 'findContours' and 'minAreaRect' functions.
  4. **Sharpening:** Apply unsharp masking with a kernel size of 3, sigma of 1, and amount of 0.5 to enhance edges.

  If the text is handwritten or the image has a complex background, consider additional steps like morphological operations or perspective correction.
`;
  if (postProcessing) {
    const postPrompt = `
      After OCR, do the following post-processing steps and return the final result, with the text extracted from the image.
      ${postProcessing}
    `;
    return `${ocrPrompt}\n\n${postPrompt}`;
  }
  return ocrPrompt;
};

const pageRagPrompt = (context: string) => {
  return `
  You are a helpful assistant and can do the following tasks:
  1. answering users's question based on the given context.
  2. finding relevant information based on the input.

  Workflow:
  1. try to answer the question based on the context.
  2. if the context is not sufficient, ask the user if he/she wants to search on web.
  3. if the user agrees, search the web and provide the answer. Don't try to answer the question without searching.

  Try to keep the answer concise and relevant to the context without providing unnecessary information and explanations.
  If you don't know how answer, just respond "I could not find the answer based on the context you provided."

  Page Context:
  ${context}
  `;
};

const prepareSystemPrompt = (
  pageText: string,
  pageURL: string,
  customPrompt?: string,
) => {
  if (customPrompt) {
    return `${customPrompt}\nPage Context:\n${pageText}\nPage URL: ${pageURL}`;
  }

  return `${pageRagPrompt(pageText)}\nPage URL: ${pageURL}`;
};

export const callPrompt = async (
  prompt: string,
  system: string,
  messageElement: HTMLElement,
) => {
  const root = createRoot(messageElement);

  try {
    const apiKey = await loadApiKey("gemini");
    const google = createGoogleGenerativeAI({ apiKey });
    const { textStream } = streamText({
      model: google("gemini-2.0-flash-exp"),
      system,
      prompt,
    });

    const results: string[] = [];
    for await (const text of textStream) {
      results.push(text);
      root.render(
        React.createElement(StreamMessage, { outputString: results.join("") }),
      );
    }
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

const genChatFunction = async (
  messages: Array<
    CoreSystemMessage | CoreUserMessage | CoreAssistantMessage | CoreToolMessage
  >,
  messageElement: HTMLElement,
) => {
  const root = createRoot(messageElement);

  try {
    const apiKey = await loadApiKey("gemini");
    const google = createGoogleGenerativeAI({ apiKey });
    const { textStream } = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages,
    });

    const results: string[] = [];
    for await (const text of textStream) {
      results.push(text);
      root.render(
        React.createElement(StreamMessage, { outputString: results.join("") }),
      );
    }
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

export const explainSentence = (
  sentences: string,
  messageElement: HTMLElement,
) =>
  callPrompt(
    `解释该英文的语法结构："${sentences}"，拆解句型、关键短语和习惯用语，深入浅出以便学生可以理解。最后翻译全句。`,
    siEnglishTeacher,
    messageElement,
  );

export const explainWord = (word: string, messageElement: HTMLElement) =>
  callPrompt(
    `解释该英语单词："${word}"，翻译并介绍其发音、词源、词根、典型例句，以及同义词和反义词。`,
    siEnglishTeacher,
    messageElement,
  );

export const summariseLink = (root: HTMLElement, messageElement: HTMLElement) =>
  callPrompt(
    `分析文本并输出文章摘要，关键字，概述，分节阅读，相关工具和参考文献。
    ${turndown(root, "code")}
    输出格式要求如下：
    语言： 采用原文同语种。如：原文是英文，输出用英文；原文是中文，输出用中文，以此类推。
    关键字： 5 个以内
    概述：200 字以内，需要突出作者想要强调的要旨
    分节阅读：
      - 如果有 <h2>，那么将每个 <h2> 总结成 3 句话，避免联想，并按原文一样的顺序排列输出。
      - 否则，那么按段落大意的相似性进行归类，总结输出。
    相关工具：如果文章中提到了一些工具，在此处列出相关工具的名称和链接。
    参考文献：如果有参考文献，列出参考文献的名称和链接。
    文章链接：文章的原始链接。
    最后进行一致性检查，确保整个输出不会出现前后矛盾与原文不符的地方，同时保证段落顺序的一致性。`,
    siSummariser,
    messageElement,
  );

export const explainCode = (message: string, messageElement: HTMLElement) =>
  callPrompt(
    `分析： ${message} ，并给出清晰的解释。
    1. 识别类型：代码、错误信息或命令行输出。
    2. 如果是代码，则给出可能的开发语言，解释代码的逻辑和功能，忽略代码中的注释、导入、类型定义、打印输出。
    3. 如果是错误信息，则解释错误的原因和解决方法。
    4. 如果是命令行输出，则解释命令的功能和输出的含义。
    `,
    siCodeExpert,
    messageElement,
  );

export const rewriteCode = (
  code: string,
  targetLang: string,
  messageElement: HTMLElement,
) =>
  callPrompt(
    `将 ${code} 代码重写为 ${targetLang} 语言的代码。`,
    siCodeExpert,
    messageElement,
  );

// TODO: Use some external image APIs for image preprocessing
// (noise reduction, binarization, deskewing, sharpening, and so on)
export const ocr = (
  url: string,
  messageElement: HTMLElement,
  postPrompt = "",
) =>
  genChatFunction(
    [
      {
        role: "user",
        content: [
          { type: "text", text: ocrExpert(postPrompt) },
          {
            type: "image",
            image: new URL(url),
          },
        ],
      },
    ],
    messageElement,
  );

let pageVector: MemVector;

export const chatWithPage = async (
  messages: CoreMessage[],
  root: HTMLElement,
  pageURL: string,
  signal: AbortSignal,
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER,
  model = DEFAULT_MODEL,
  customPrompt?: string,
) => {
  if (MODEL_PROVIDERS.indexOf(provider) === -1) {
    throw new Error("Invalid provider");
  }

  let context = turndown(root);
  if (provider !== "gemini") {
    if (!pageVector) {
      pageVector = new MemVector(root);
      await pageVector.indexing();
    }

    const userMessage = messages[messages.length - 1].content.toString();
    context = (await pageVector.search(userMessage)).join("\n");
  }

  try {
    const apiKey = await loadApiKey(provider);
    const modelProvider =
      provider === "gemini"
        ? createGoogleGenerativeAI({ apiKey })
        : createGroq({ apiKey });
    const { textStream } = streamText({
      model: modelProvider(model),
      system: prepareSystemPrompt(context, pageURL, customPrompt),
      // tools: {
      //   search: createGoogleSearch({
      //     apiKey: process.env.PLASMO_PUBLIC_GOOGLE_SEARCH_API_KEY,
      //     cx: process.env.PLASMO_PUBLIC_GOOGLE_SEARCH_CX,
      //   }),
      //   summarise: createSummarizer(document.body.innerHTML),
      // },
      messages,
      abortSignal: signal,
    });
    return textStream;
  } catch (e) {
    return e.message;
  }
};
