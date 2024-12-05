"use client";
import { CircleStop, IterationCcw, SquareX } from "lucide-react";
import { marked } from "marked";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { CopyIcon } from "~/components/ui/icons/copy";
import { RefreshIcon } from "~/components/ui/icons/refresh";
import { SquarePenIcon } from "~/components/ui/icons/square-pen";
import { ScrollArea } from "~/components/ui/scroll-area";
import chatStyles from "~/css/chatui.module.css";
import iconsStyles from "~/css/icons.module.css";
import { cn, upperCaseFirstLetter } from "~lib/utils";
import { chatWithPage } from "~utils/ai";
import { ActionIcon } from "./ActionIcon";
import { StreamMessage } from "./StreamMessage";
import SystemPromptMenu from "./SystemPromptMenu";
import { DownloadIcon } from "./ui/icons/download";
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
  readonly pageText: string;
  readonly pageURL: string;
}

export function ChatUI({ pageText, pageURL }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [systemPrompt, setSystemPrompt] = useState({
    name: "Default",
    options: {},
  });

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

  const handleSend = async (
    e: React.FormEvent,
    customMessages?: Message[],
    lastUserMessage?: string,
  ) => {
    const currentMessage = inputValue.trim() || lastUserMessage.trim();
    e.preventDefault();
    if (isSubmitting || !currentMessage) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (currentMessage.trim()) {
      try {
        abortController.current = new AbortController();
        const baseMessages = customMessages || messages;

        // Only add a new user message if we're not editing
        const newMessages = (
          customMessages
            ? baseMessages
            : [
                ...baseMessages,
                {
                  content: currentMessage,
                  role: "user",
                  id: baseMessages.length,
                },
              ]
        ) as Message[];

        setInputValue("");
        const textarea = document.getElementById("tsw-chat-textarea");
        if (textarea) {
          textarea.style.height = "80px";
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
          pageURL,
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
    setInputValue("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim() || editingMessageId === null) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === editingMessageId ? { ...msg, content: inputValue } : msg,
    );

    const messagesBeforeEdit = updatedMessages.filter(
      (msg) => msg.id <= editingMessageId,
    );

    setMessages(messagesBeforeEdit);
    setEditingMessageId(null);
    await handleSend(e, messagesBeforeEdit);
  };

  const handleRefresh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || messages.length < 2) return;

    const lastUserMessageIndex = messages.length - 2;
    const messagesUpToLastUser = messages.slice(0, lastUserMessageIndex + 1);
    setMessages(messagesUpToLastUser);
    await handleSend(
      e,
      messagesUpToLastUser,
      messages[lastUserMessageIndex].content,
    );
  };
  const handleDownload = () => {
    if (messages.length === 0) return;

    const content = `# ${document.title}

${messages.map((m) => `${m.role.toUpperCase()}:\n ${m.content}`).join("\n\n")};

source: ${window.location.href}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      description: "Downloaded.",
    });
  };
  const handlePromptSelect = (prompt: any) => {
    setSystemPrompt(prompt);
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
            {messages.map((m, index) => (
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
                        <CopyIcon
                          size={16}
                          className={iconsStyles.dynamicIcon}
                        />
                      </Button>
                      {m.role === "user" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={chatStyles.tswActionBtn}
                          onClick={() => handleEdit(m)}
                          disabled={isStreaming || editingMessageId !== null}
                        >
                          <SquarePenIcon
                            size={16}
                            className={iconsStyles.dynamicIcon}
                          />
                        </Button>
                      )}
                      {m.role === "assistant" &&
                        index === messages.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={chatStyles.tswActionBtn}
                            onClick={(e) => handleRefresh(e)}
                            disabled={isStreaming || editingMessageId !== null}
                          >
                            <RefreshIcon
                              size={16}
                              className={iconsStyles.dynamicIcon}
                            />
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
              minHeight: "80px",
              maxHeight: "200px",
              overflow: "auto",
              resize: "none",
              height: "unset",
            }}
            id="tsw-chat-textarea"
          />
          <div className={chatStyles.editActions}>
            <div>
              <SystemPromptMenu
                category="system-prompts"
                onSelect={(prompt) => handlePromptSelect(prompt)}
              />
            </div>
            <div>
              {editingMessageId !== null && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={chatStyles.tswActionBtn}
                    onClick={handleCancelEdit}
                  >
                    <SquareX />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={chatStyles.tswActionBtn}
                    onClick={(e) => handleEditSubmit(e)}
                  >
                    <IterationCcw />
                  </Button>
                </>
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
        </div>
        {messages.length > 0 && (
          <div className={chatStyles.downloadButtonContainer}>
            <Button
              variant="ghost"
              size="icon"
              className={chatStyles.tswActionBtn}
              onClick={handleDownload}
            >
              <DownloadIcon size={16} className={iconsStyles.dynamicIcon} />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
