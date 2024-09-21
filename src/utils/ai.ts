import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const siEnglishTeacher =
  "你是一名资深英语老师有丰富的教学经验，可以深入浅出的用中文讲解英文疑难杂句和单词释义。";
const siSummariser =
  "You are good at summarising articles. Based on a link passed by user, your task is to highlight the main key points in the article pointed by that link and output them in the format as users expect.";

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
    `分析链接： ${link} ，输出格式要求如下：
    语言： 采用原文同语种。如：原文是英文，输出用英文；原文是中文，输出用中文，以此类推。
    关键字： 5 个以内
    概述：200 字以内，需要突出作者想要强调的要旨
    段落大意：将文中每个段落用两三句话总结，并按原文一样的顺序排列输出。
    最后进行一致性检查，确保整个输出不会出现前后矛盾与原文不符的地方，同时保证段落顺序的一致性。`,
    siSummariser
  );
