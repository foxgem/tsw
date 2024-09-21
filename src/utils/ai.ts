import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const siEnglishTeacher =
  "你是一名资深英语老师有丰富的教学经验，可以深入浅出的用中文讲解英文疑难杂句和单词释义。";
const siSummariser = "You are good at summarising articles.";

const generateTextAIFunction = async (prompt: string, systemInstruction: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });
  const result = await model.generateContent(prompt);
  return marked.parse(result.response.text());
};

export const explainSentence = (sentences: string) =>
  generateTextAIFunction(
    `解释该英文的语法结构："${sentences}"，拆解句型、关键短语和习惯用语，深入浅出以便学生可以理解。最后翻译全句。`,
    siEnglishTeacher
  );

export const explainWord = (word: string) =>
  generateTextAIFunction(
    `解释该英语单词："${word}"，翻译并介绍其发音、词源、词根、典型例句，以及同义词和反义词。`,
    siEnglishTeacher
  );

export const summariseLink = (link: string) =>
  generateTextAIFunction(
    `分析链接：${link}  中包含的文章内容并总结。要求如下：
    1. 输出格式要求：采用与原文同样的语种进行输出。即若原文是英文，则输出用英文；原文是中文，输出用中文，以此类推。
    2. 内容要求：
    - 关键字。
    - 用 100 字概括文章要点。
    3. 一致性要求：将上面内容与原文重新对照进行修正`,
    siSummariser
  );
