import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import {
  type CoreMessage,
  type CoreTool,
  generateObject,
  streamText,
} from "ai";
import React from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { StreamMessage } from "~/components/StreamMessage";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_PROVIDER,
  MODEL_PROVIDERS,
  type ModelProvider,
} from "~/utils/constants";
import { loadApiKey, turndown } from "~ai/utils";
import { MemVector } from "~ai/vector";
import type { KnowledgeCardData } from "~components/KnowledgeCard";
import type { MindmapData } from "~components/Mindmap";
import { type Tools, toolRegistry } from "./tools";

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

const siMindmap = `Based on the given article:
        1. try to summary and extra the key points for the diagram generation.
        2. these key points must be informative and concise.
        3. these key points should highlight the author's viewpoints.
        4. try to keep the key points in a logical order.
        5. don't include any extra explanation and irrelevant information.

        Use them to generate a Mindmap.
        Mindmap syntax rules:
        - Each line should not have any quotes marks
        - Do not include 'mermaid' at the start of the diagram
        - Do not use 3-nesting parentheses for root, ie: "root((Mixture of Experts (MoE)))". The correct is "root((MoE))"
        - Do not use abbreviations with parentheses in the middle of a line, but it can be used at the end of a line
        - Do not use any special characters in the diagram except emojis
        - Keep function name without parameters when you are reading a programming article, ie: free, not free()
        - Can only have one root node, ie no other node can be at the same level as the root node.
        - Basic structure example:
        <Basic Structure>
        mindmap
          Root
            A
              B
              C

        Each node in the mindmap can be different shapes:
        <Square>
        id[I am a square]
        <Rounded square>
        id(I am a rounded square)
        <Circle>
        id((I am a circle))
        <Bang>
        id))I am a bang((
        <Cloud>
        id)I am a cloud(
        <Hexagon>
        id{{I am a hexagon}}
        <Default>
        I am the default shape

        Icons can be used in the mindmap with syntax: "::icon()"

        Markdown string can be used like the following:
        <Markdown string>
        mindmap
            id1["\`**Root** with
        a second line
        Unicode works too: 🤓\`"]
              id2["\`The dog in **the** hog... a *very long text* that wraps to a new line\`"]
              id3[Regular labels still works]

        Here is a mindmap example:
        <example mindmap>
        mindmap
          root((mindmap))
            Origins
              Long history
              ::icon(fa fa-book)
              Popularisation
                British popular psychology author Tony Buzan
            Research
              On effectiveness<br/>and features
              On Automatic creation
                Uses
                    Creative techniques
                    Strategic planning
                    Argument mapping
            Tools
              Pen and paper
              Mermaid

        The max deepth of the generated mindmap should be 4.

        The output syntax should be correct. Try to avoid the following common errors:
        - never use \" in the output
        - \`\`\`mermaid in the output
        <error examples>
        - Gating network (G) decides experts (E)
          - fixed: Gating network decides experts
        - root((Mixture of Experts (MoE)))
          - fixed: root((MoE))
        - 2017: Shazeer et al. (Google) - 137B LSTM
          - fixed: 2017: Shazeer et al. Google 137B LSTM
        - calloc()
          - fixed: calloc
        - sbrk(0) returns current break
          - fixed: sbrk:0 returns current break
        - Allocate N + sizeof(header_t) bytes
          - fixed: Allocate N + sizeof header_t bytes

        Review the output to ensure it is logical and follows the correct syntax, if not, correct it.
    `;

const siKnowledge =
  "分析文本并输出文章摘要，关键字，概述，分节阅读，相关工具和参考文献。需要注意：5个关键字，5个关键点";

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
    return results;
  } catch (e) {
    root.render(
      React.createElement(StreamMessage, { outputString: e.message }),
    );
  }
};

const genChatFunction = async (
  messages: Array<CoreMessage>,
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

export const summariseLink = async (
  root: HTMLElement,
  link: string,
  messageElement: HTMLElement,
) => {
  return await callPrompt(
    `分析文本并输出文章摘要，关键字，概述，分节阅读，相关工具和参考文献。
    ${turndown(root, "code")}
    输出格式要求如下：
    语言： 采用原文同语种。如：原文是英文，输出用英文；原文是中文，输出用中文，以此类推。
    关键字： 5 个以内。用英文逗号分隔。例如： key1, key2, ...
    概述：200 字以内，需要突出作者想要强调的要旨
    分节阅读：
      - 如果有 <h2>，那么将每个 <h2> 总结成 3 句话，避免联想，并按原文一样的顺序排列输出。
      - 否则，那么按段落大意的相似性进行归类，总结输出。
    相关工具：如果文章中提到了一些工具，在此处列出相关工具的名称和链接。
    参考文献：如果有参考文献，列出参考文献的名称和链接。
    原文链接：${link}。
    最后进行一致性检查，确保整个输出不会出现前后矛盾与原文不符的地方，同时保证段落顺序的一致性。`,
    siSummariser,
    messageElement,
  );
};

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

export const genObject = async (
  prompt: string,
  system: string,
  schema: z.Schema,
) => {
  try {
    const apiKey = await loadApiKey("gemini");
    const google = createGoogleGenerativeAI({ apiKey });

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema,
      system,
      prompt,
    });

    return object;
  } catch (e) {
    return { error: true, message: e.message };
  }
};

const MindmapSchema = z.object({
  title: z.string(),
  description: z.string(),
  diagram: z.string(),
});

export const generateMindmap = async (
  root: HTMLElement,
): Promise<MindmapData> => {
  const result = await genObject(
    turndown(root, "code"),
    siMindmap,
    MindmapSchema,
  );
  return result;
};

const KnowledgeCardSchema = z.object({
  title: z.string(),
  keywords: z.array(z.string()),
  keyPoints: z.array(z.string()),
  originalLink: z.string(),
  references: z.object({
    tools: z.array(
      z.object({
        title: z.string(),
        link: z.string(),
      }),
    ),
    attachments: z.array(
      z.object({
        title: z.string(),
        link: z.string(),
      }),
    ),
  }),
});

export const generateKnowledgeCard = async (
  root: HTMLElement,
): Promise<KnowledgeCardData> => {
  const result = await genObject(
    turndown(root, "code"),
    siKnowledge,
    KnowledgeCardSchema,
  );
  return result;
};

let pageVector: MemVector;

export const chatWithPage = async (
  messages: CoreMessage[],
  root: HTMLElement,
  pageURL: string,
  signal: AbortSignal,
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER,
  modelName = DEFAULT_MODEL,
  tools: Tools = {},
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

  const filteredMessages = messages.filter((msg) => msg.role !== "tool");

  try {
    const apiKey = await loadApiKey(provider);
    const model =
      provider === "gemini"
        ? createGoogleGenerativeAI({ apiKey })(modelName)
        : createGroq({ apiKey })(modelName);

    const filteredTools: Record<string, CoreTool> = {};
    if (modelName !== "gemini-2.0-flash-thinking-exp") {
      for (const [key, tool] of Object.entries(tools)) {
        filteredTools[key] = tool.createCoreTool(
          toolRegistry.getToolSettings(tool.name),
        );
      }
    }

    const { textStream, toolResults } = streamText({
      model,
      system: prepareSystemPrompt(context, pageURL, customPrompt),
      tools: filteredTools,
      messages: filteredMessages,
      abortSignal: signal,
    });
    return { textStream, toolResults };
  } catch (e) {
    return e.message;
  }
};
