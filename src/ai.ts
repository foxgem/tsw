import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const siEnglishTeacher =
  "你是一名资深英语老师有丰富的教学经验，可以深入浅出的讲解英文疑难杂句和单词释义。";

const generateExplanation = async (prompt: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: siEnglishTeacher,
  });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return marked.parse(text);
};

export const explainSentence = (sentences: string) =>
  generateExplanation(
    `解释该英文的语法结构："${sentences}"，拆解句型、关键短语和习惯用语，深入浅出以便学生可以理解。最后翻译全句。`
  );
export const explainWord = (word: string) =>
  generateExplanation(
    `解释该英语单词："${word}"，翻译并介绍其词源、词根、典型例句，以及同义词和反义词。`
  );
