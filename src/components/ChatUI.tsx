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

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
};

export interface ChatUIProps {
  pageText: string;
}

export function ChatUI({ pageText }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "hi, how can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const { toast } = useToast();

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatBody = document.querySelector(".tsw-chat-body");
      chatBody?.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  useEffect(() => {
    const header = document.querySelector(".tsw-panel-header");
    const footer = document.querySelector(".tsw-panel-footer");

    if (header && footer) {
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
    if (isSubmitting || !input.trim()) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (input.trim()) {
      try {
        abortController.current = new AbortController();
        const newMessages: Message[] = [
          ...messages,
          { content: input, role: "user", id: messages.length },
        ];
        setInput("");
        const textarea = document.querySelector("textarea");
        if (textarea) {
          textarea.style.height = "40px";
        }
        setMessages(newMessages);
        scrollToBottom();
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
      <div className="w-full max-w-2xl mx-auto flex flex-col tsw-chat-body h-[calc(100vh-var(--header-height)-var(--footer-height))] ">
        <div className="flex-grow">
          <ScrollArea className="h-full pr-4 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-1 ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div>
                  <div
                    className={`flex items-start ${m.role === "user" ? "justify-end" : ""} tsw-chat-item ${
                      String(m.content).split("\n").length === 1
                        ? "tsw-chat-item-single"
                        : ""
                    } `}
                  >
                    {m.role === "assistant" && (
                      <ActionIcon name={upperCaseFirstLetter(m.role)} />
                    )}
                    <div
                      className={`rounded-lg max-w-[80%] ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {m.role === "user" || m.id === 0 ? (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: marked(m.content as string),
                          }}
                        />
                      ) : (
                        <StreamMessage
                          outputString={m.content as string}
                          onStreamComplete={(isComplete) => {
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === m.id ? { ...msg, isComplete } : msg,
                              ),
                            );
                            scrollToBottom();
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
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mx-9`}
                  >
                    {m.id !== 0 &&
                      (m.role === "user" || m.isComplete) &&
                      m.content && (
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
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      <div className="tsw-panel-footer">
        <div className="flex items-center border border-[#E0E0E0] justify-between w-full rounded-[8px]">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="flex-grow min-h-[40px] max-h-[120px] resize-none w-full border-0 rounded-[8px]"
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
