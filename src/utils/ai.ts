import { Content, GoogleGenerativeAI, Part } from "@google/generative-ai";
import { Storage } from "@plasmohq/storage";
import { escape } from "html-escaper";
import { marked } from "marked";

const genAI = async () => {
  const storage = new Storage();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || (await storage.get("apiKey"));
  if (!apiKey) {
    throw new Error("Google Generative AI API key not found in environment variables or storage");
  }
  return new GoogleGenerativeAI(apiKey);
};

const siEnglishTeacher =
  "你是一名资深英语老师有丰富的教学经验，可以深入浅出的用中文讲解英文疑难杂句和单词释义。";
const siSummariser =
  "You are good at summarising articles. Based on a link passed by user, your task is to highlight the main key points in the article pointed by that link and output them in the format as users expect.";

const siCodeExpert = `
  You are a coding expert. You are good at:
  1. Explaining code snippets.
  2. Rewriting an existing code snippet into a new code snippet with a specified programming language.
  3. Explaining the reason of the given error messages.`;

const ocrExpert = `
  OCR this image. Extract the text as it is, without analyzing or summarizing.

  Before OCR, consider the following pre-processing steps:
  1. **Noise reduction:** Apply Gaussian blur with a sigma of 1.5 to reduce noise.
  2. **Binarization:** Use adaptive thresholding with a block size of 11 and C=2 to convert the image to black and white.
  3. **Deskewing:** Correct the image tilt using OpenCV's 'findContours' and 'minAreaRect' functions.
  4. **Sharpening:** Apply unsharp masking with a kernel size of 3, sigma of 1, and amount of 0.5 to enhance edges.

  If the text is handwritten or the image has a complex background, consider additional steps like morphological operations or perspective correction.
`;

const genAIFunction = async (
  prompt: string | Array<string | Part>,
  systemInstruction: string | Part | Content,
  rawOutput = false
) => {
  const model = (await genAI()).getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });
  const result = (await model.generateContent(prompt)).response.text();
  return rawOutput ? `<pre>${marked.parse(escape(result))}</pre>` : marked.parse(result);
};

export const explainSentence = (sentences: string) =>
  genAIFunction(
    `解释该英文的语法结构："${sentences}"，拆解句型、关键短语和习惯用语，深入浅出以便学生可以理解。最后翻译全句。`,
    siEnglishTeacher
  );

export const explainWord = (word: string) =>
  genAIFunction(
    `解释该英语单词："${word}"，翻译并介绍其发音、词源、词根、典型例句，以及同义词和反义词。`,
    siEnglishTeacher
  );

export const summariseLink = (link: string) =>
  genAIFunction(
    `分析链接： ${link} ，输出格式要求如下：
    语言： 采用原文同语种。如：原文是英文，输出用英文；原文是中文，输出用中文，以此类推。
    关键字： 5 个以内
    概述：200 字以内，需要突出作者想要强调的要旨
    段落大意：将文中每个段落用两三句话总结，并按原文一样的顺序排列输出。
    最后进行一致性检查，确保整个输出不会出现前后矛盾与原文不符的地方，同时保证段落顺序的一致性。`,
    siSummariser
  );

export const explainCode = (message: string) =>
  genAIFunction(
    `分析： ${message} ，并给出清晰的解释。
    1. 识别类型：代码、错误信息或命令行输出。
    2. 如果是代码，则给出可能的开发语言，解释代码的逻辑和功能，忽略代码中的注释、导入、类型定义、打印输出。
    3. 如果是错误信息，则解释错误的原因和解决方法。
    4. 如果是命令行输出，则解释命令的功能和输出的含义。
    `,
    siCodeExpert
  );

export const rewriteCode = (code: string, targetLang: string) =>
  genAIFunction(`将 ${code} 代码重写为 ${targetLang} 语言的代码。`, siCodeExpert);

// TODO: Use some external image APIs for image preprocessing
// (noise reduction, binarization, deskewing, sharpening, and so on)
export const ocr = (imageBuffer: Buffer, imageMimeType: string, postPrompt = "") =>
  genAIFunction(
    [
      {
        inlineData: { mimeType: imageMimeType, data: imageBuffer.toString("base64") },
      },
    ],
    ocrExpert + postPrompt,
    true
  );
