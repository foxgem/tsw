"use client";
import type { CoreMessage } from "ai";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { chatWithPage } from "~/ai/ai";
import { ScrollArea } from "~/components/ui/scroll-area";
import chatStyles from "~/css/chatui.module.css";
import type { Message } from "./ChatUI";
import { AssistantMessage } from "./MessageRenders";

marked.setOptions({
  breaks: true,
});

export interface ThinkingUIProps {
  readonly pageRoot: HTMLElement;
  readonly pageURL: string;
}

export function ThinkingUI({ pageRoot, pageURL }: ThinkingUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const abortController = useRef<AbortController | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (round % 2 === 0 && round < 10) {
      kickOff(think);
    }
  }, [round]);

  useEffect(() => {
    if (
      round % 2 === 1 &&
      round < 10 &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user"
    ) {
      kickOff(answer);
    }
  }, [round, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        });
      }
    }
  }, [messages]);

  const generateThinkingMessages = () => {
    const thinkingMessages: CoreMessage[] = [];
    for (const m of messages) {
      const tm = { ...m };
      tm.role = m.role === "assistant" ? "user" : "assistant";
      thinkingMessages.push(tm);
    }
    return thinkingMessages.length > 0
      ? thinkingMessages
      : [{ role: "user", content: "What's your question?", id: 0 }];
  };

  const think = async () => {
    abortController.current = new AbortController();
    try {
      const thinkingHistory = generateThinkingMessages();
      const allMessages = [...messages];
      setMessages([
        ...allMessages,
        { role: "user", content: "TSW", id: messages.length, isThinking: true },
      ]);
      const { textStream } = await chatWithPage(
        thinkingHistory,
        pageRoot,
        pageURL,
        abortController.current?.signal,
        "gemini",
        "gemini-2.0-flash-exp",
        {},
        `You are good at critical thinking.
      Analyze the page context and the given messages, then ask a challenging and relevant question.
      Don't show the thinking process and unnecessary information or explanations, just respond a question.
      The question should be a new one, not a repetition of the previous questions.
      `,
      );

      let fullText = "";
      for await (const text of textStream) {
        fullText += text;
        setMessages([
          ...allMessages,
          { role: "user", content: fullText, id: messages.length },
        ]);
      }
    } finally {
      abortController.current = null;
    }
  };

  const kickOff = async (fn) => {
    await fn();
    setRound(round + 1);
  };

  const answer = async () => {
    abortController.current = new AbortController();
    try {
      const allMessages = [...messages];
      setMessages([
        ...allMessages,
        {
          role: "assistant",
          content: "TSW",
          id: messages.length,
          isThinking: true,
        },
      ]);
      const { textStream } = await chatWithPage(
        allMessages,
        pageRoot,
        pageURL,
        abortController.current?.signal,
        "gemini",
        "gemini-2.0-flash-exp",
        {},
        `You're the writer of a given article.
      You are responsible for answering the questions about your article.
      You must be objective and support your answers with evidence.
      Try to understand why the questions are being asked.
      If you find the questions are helpful to fix your article, then you're on the right track.
      Try to keep the answers concise and relevant to the questions without providing unnecessary information and explanations.
      `,
      );

      let fullText = "";
      for await (const text of textStream) {
        fullText += text;
        setMessages([
          ...allMessages,
          { role: "assistant", content: fullText, id: messages.length },
        ]);
      }
    } finally {
      abortController.current = null;
    }
  };

  return (
    <>
      <div className={chatStyles.chatContainer} id="tsw-chat-container">
        <div className={chatStyles.chatContent}>
          <ScrollArea className={chatStyles.scrollArea}>
            {messages.map((m, index) => (
              <div key={m.id}>
                <AssistantMessage
                  message={m}
                  onSetMessage={setMessages}
                  messagesLength={messages.length}
                  messageIndex={index}
                />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
