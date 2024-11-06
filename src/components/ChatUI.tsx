"use client";
import { CircleStop, Copy, Pencil } from "lucide-react";
import { marked } from "marked";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import chatStyles from "~/css/chatui.module.css";
import { cn, upperCaseFirstLetter } from "~lib/utils";
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
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [originalMessage, setOriginalMessage] = useState<string>("");

  const { toast } = useToast();

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

  useEffect(() => {
    const header = document.getElementById("tsw-panel-header");
    const footer = document.getElementById("tsw-panel-footer");

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

  const handleSend = async (e: React.FormEvent, customMessages?: Message[]) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim()) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (inputValue.trim()) {
      try {
        abortController.current = new AbortController();
        const baseMessages = customMessages || messages;

        // Only add a new user message if we're not editing
        const newMessages = (
          customMessages
            ? baseMessages
            : [
                ...baseMessages,
                { content: inputValue, role: "user", id: baseMessages.length },
              ]
        ) as Message[];

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
            id: newMessages.length,
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
            { role: "assistant", content: fullText, id: newMessages.length },
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

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setOriginalMessage(message.content);
    setInputValue(message.content);

    requestAnimationFrame(() => {
      const textarea = document.getElementById(
        "tsw-chat-textarea",
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setOriginalMessage("");
    setInputValue("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim() || editingMessageId === null) return;

    // Update the edited message
    const updatedMessages = messages.map((msg) =>
      msg.id === editingMessageId ? { ...msg, content: inputValue } : msg,
    );

    // Remove all messages after the edited message
    const messagesBeforeEdit = updatedMessages.filter(
      (msg) => msg.id <= editingMessageId,
    );

    setMessages(messagesBeforeEdit);
    setEditingMessageId(null);
    setOriginalMessage("");

    // Continue the chat with the edited message
    await handleSend(e, messagesBeforeEdit);
  };

  return (
    <>
      <div className={chatStyles.chatContainer}>
        <div className={chatStyles.chatContent}>
          <ScrollArea className={chatStyles.scrollArea}>
            {messages.length === 0 && (
              <div className={chatStyles.welcomeMessage}>
                Hi, how can I help you?
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  chatStyles.messageContainer,
                  m.role === "user"
                    ? chatStyles.userMessage
                    : chatStyles.assistantMessage,
                )}
              >
                <div
                  className={cn(
                    chatStyles.chatItemContainer,
                    m.role === "user" ? chatStyles.userChatItem : "",
                    chatStyles.tswChatItem,
                    String(m.content).split("\n").length === 1
                      ? chatStyles.tswChatItemSingle
                      : "",
                  )}
                >
                  {m.role === "assistant" && (
                    <ActionIcon name={upperCaseFirstLetter(m.role)} />
                  )}
                  <div className={chatStyles.messageContent}>
                    {m.role === "user" || m.id === 0 ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: marked(m.content as string),
                        }}
                      />
                    ) : m.content === "TSW" ? (
                      <div className={chatStyles.loadingContainer}>
                        <div className={chatStyles.loadingDot}>
                          <div className={chatStyles.dotBase} />
                          <div className={chatStyles.dotPing} />
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
                    <div className={chatStyles.tswUser}>
                      <ActionIcon name={upperCaseFirstLetter(m.role)} />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    chatStyles.actionContainer,
                    m.role === "user"
                      ? chatStyles.userActionContainer
                      : chatStyles.assistantActionContainer,
                  )}
                >
                  {(m.role === "user" || m.isComplete) && m.content && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={chatStyles.tswActionBtn}
                        onClick={() => copyToClipboard(m.content)}
                      >
                        <Copy size={16} />
                      </Button>
                      {m.role === "user" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={chatStyles.tswActionBtn}
                          onClick={() => handleEdit(m)}
                          disabled={isStreaming || editingMessageId !== null}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      <div className={chatStyles.tswPanelFooter} id="tsw-panel-footer">
        <div className={chatStyles.inputContainer}>
          <Textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-resize the textarea
              const textarea = e.target as HTMLTextAreaElement;
              textarea.style.height = "auto";
              textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Set maximum height to 200px
            }}
            placeholder={
              editingMessageId !== null
                ? "Edit your message..."
                : "Type your message..."
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                if (editingMessageId !== null) {
                  handleEditSubmit(e);
                } else {
                  handleSend(e);
                }
              }
            }}
            className={chatStyles.textarea}
            rows={1}
            style={{
              minHeight: "40px",
              maxHeight: "200px",
              overflow: "auto",
              resize: "none",
            }}
            id="tsw-chat-textarea"
          />
          {editingMessageId !== null && (
            <div className={chatStyles.editActions}>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => handleEditSubmit(e)}
              >
                Update
              </Button>
            </div>
          )}
          {isStreaming && !editingMessageId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStopChat}
              className={chatStyles.tswActionBtn}
            >
              <CircleStop className={chatStyles.stopIcon} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
