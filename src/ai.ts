import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function explain(english: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "你是一名资深英语老师有丰富的教学经验，可以深入浅出的讲解英文疑难杂句。",
  });
  const prompt = `解释该英文的语法结构："${english}"，拆解句型、关键短语和习惯用语，深入浅出以便学生可以理解。最后翻译全句。`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return marked.parse(text);
}
