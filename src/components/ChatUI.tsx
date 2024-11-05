"use client";
import { CircleStop, Copy } from "lucide-react";
import { marked } from "marked";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { upperCaseFirstLetter } from "~lib/utils";
import { chatWithPage } from "~utils/ai";
import { ActionIcon } from "./ActionIcon";
import { StreamMessage } from "./StreamMessage";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

marked.setOptions({
  breaks: true,
});

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
  isThinking?: boolean;
};

export interface ChatUIProps {
  pageText: string;
}

export function ChatUI({ pageText }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (messages.length > 0) {
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      console.log(viewport.scrollHeight);
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

  useEffect(() => {
    const header = document.querySelector(".tsw-panel-header");
    const footer = document.querySelector(".tsw-panel-footer");

    console.log(header, footer);
    if (header && footer) {
      console.log(header.getBoundingClientRect().height);

      console.log(footer.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
      document.documentElement.style.setProperty(
        "--footer-height",
        `${footer.getBoundingClientRect().height}px`,
      );
    }
  }, []);

  const handleStopChat = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
      setIsStreaming(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim()) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (inputValue.trim()) {
      console.log("inputValue", inputValue);
      try {
        abortController.current = new AbortController();
        const newMessages: Message[] = [
          ...messages,
          { content: inputValue, role: "user", id: messages.length },
        ];
        setInputValue("");
        const textarea = document.getElementById("tsw-chat-textarea");
        if (textarea) {
          textarea.style.height = "40px";
        }
        setMessages(newMessages);

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "TSW",
            id: messages.length + 1,
            isThinking: true,
          },
        ]);

        const textStream = await chatWithPage(
          newMessages,
          pageText,
          abortController.current.signal,
        );
        let fullText = "";

        for await (const text of textStream) {
          fullText += text;
          setMessages([
            ...newMessages,
            { role: "assistant", content: fullText, id: messages.length + 1 },
          ]);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Chat was stopped");
        }
      } finally {
        setIsSubmitting(false);
        abortController.current = null;
        setIsStreaming(false);
      }
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        description: "Copied.",
      });
    });
  };

  return (
    <>
      <div className="flex flex-col tsw-chat-body h-[calc(100vh-var(--header-height)-var(--footer-height)-36px)]">
        <div className="flex-grow">
          <ScrollArea className="h-[calc(100vh-var(--header-height)-var(--footer-height)-36px)] pr-4 pb-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="h-[calc(100vh-var(--header-height)-var(--footer-height)-36px)] flex items-center justify-center font-semibold text-[32px] bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Hi, how can I help you?
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-1 ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div
                  className={`flex items-start ${m.role === "user" ? "justify-end" : ""} tsw-chat-item group ${
                    String(m.content).split("\n").length === 1
                      ? "tsw-chat-item-single"
                      : ""
                  } `}
                >
                  {m.role === "assistant" && (
                    <ActionIcon name={upperCaseFirstLetter(m.role)} />
                  )}
                  <div className="rounded-lg max-w-[80%]">
                    {m.role === "user" || m.id === 0 ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: marked(m.content as string),
                        }}
                      />
                    ) : m.content === "TSW" ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                        </div>
                      </div>
                    ) : (
                      <StreamMessage
                        outputString={m.content as string}
                        onStreamComplete={(isComplete) => {
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === m.id ? { ...msg, isComplete } : msg,
                            ),
                          );
                        }}
                      />
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="tsw-user">
                      <ActionIcon name={upperCaseFirstLetter(m.role)} />
                    </div>
                  )}
                </div>
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mx-[36px]`}
                >
                  {(m.role === "user" || m.isComplete) && m.content && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="tsw-action-btn"
                      onClick={() => copyToClipboard(m.content)}
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      <div className="tsw-panel-footer">
        <div className="flex items-center border border-[#E0E0E0] justify-between w-full rounded-[8px] bg-[#efefef]">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="flex-grow min-h-[40px] max-h-[120px] resize-none border-0 rounded-[8px] bg-[#efefef]"
            rows={1}
            style={{
              height: "auto",
              overflow: "hidden",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              if (target.value.trim() === "") {
                target.style.height = "40px";
              } else {
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 80)}px`;
              }
            }}
            id="tsw-chat-textarea"
          />
          {isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStopChat}
              className="tsw-action-btn"
            >
              <CircleStop className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
