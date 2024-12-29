"use client";
import type { CoreMessage } from "ai";
import { CircleStop, IterationCcw, SquareX } from "lucide-react";
import { marked } from "marked";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { chatWithPage } from "~/ai/ai";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import chatStyles from "~/css/chatui.module.css";
import { formatMessageContent, getProviderFromModel } from "~/lib/utils";
import { AVAILABLE_TOOLS, type Tools } from "~ai/tools";
import {
  DEFAULT_MODEL,
  DEFAULT_MODEL_PROVIDER,
  type ModelProvider,
} from "~utils/constants";
import { readInstantInputs } from "~utils/storage";
import { getEnabledTools } from "~utils/toolsstorage";
import textselectStyles from "../css/textselect.module.css";
import { ExportDialog } from "./ExportDialog";
import { AssistantMessage, ToolMessage, UserMessage } from "./MessageRenderers";
import ModelMenu from "./ModelMenu";
import { SelectInstantInput } from "./SelectInstantInput";
import { ToolsSelect } from "./ToolsSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

marked.setOptions({
  breaks: true,
});

export type Message = CoreMessage & {
  id: number;
  isComplete?: boolean;
  isThinking?: boolean;
  isError?: boolean;
};

export interface ChatUIProps {
  readonly pageRoot: HTMLElement;
  readonly pageURL: string;
}

export function ChatUI({ pageRoot, pageURL }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [modelProvider, setModelProvider] = useState<ModelProvider>(
    DEFAULT_MODEL_PROVIDER,
  );
  const [showInstantInput, setShowInstantInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tswPanelFooterRef = useRef<HTMLDivElement>(null);
  const [instantInputs, setInstantInputs] = useState<string[]>([]);
  const [tools, setTools] = useState<Tools>();
  const [footerWidth, setFooterWidth] = useState<string>("100%");

  const loadInstantInputs = async () => {
    const savedInputs = await readInstantInputs();
    setInstantInputs(savedInputs);
  };

  const { toast } = useToast();

  useEffect(() => {
    const loadTools = async () => {
      const savedToolKeys = (await getEnabledTools()) || [];
      const savedTools = savedToolKeys.reduce((acc, key) => {
        if (key in AVAILABLE_TOOLS) {
          acc[key] = AVAILABLE_TOOLS[key];
        }
        return acc;
      }, {} as Tools);
      setTools(savedTools);
    };

    loadTools();
  }, []);

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
    const currentMessage = inputValue.trim() || lastUserMessage?.trim();
    e.preventDefault();
    if (isSubmitting || !currentMessage) return;
    setIsSubmitting(true);
    setIsStreaming(true);

    if (currentMessage.trim()) {
      try {
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
        await generateContent(newMessages);
      } catch (error) {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          if (
            lastMessage.role === "assistant" &&
            lastMessage.content === "TSW"
          ) {
            return messages.map((msg, index) =>
              index === messages.length - 1
                ? { ...msg, content: error.message, isError: true }
                : msg,
            );
          }
          return messages;
        });

        if (error.name === "AbortError") {
          console.log("Chat was stopped");
        } else {
          console.error("Error during chat:", error.message);
        }
      } finally {
        setIsSubmitting(false);
        abortController.current = null;
        setIsStreaming(false);
      }
    }
  };

  const generateContent = async (newMessages: Message[]) => {
    abortController.current = new AbortController();
    setMessages([
      ...newMessages,
      {
        role: "assistant",
        content: "TSW",
        id: newMessages.length,
        isThinking: true,
      },
    ]);

    const { textStream, toolResults } = await chatWithPage(
      newMessages,
      pageRoot,
      pageURL,
      abortController.current.signal,
      modelProvider,
      model,
      tools,
    );

    let fullText = "";
    for await (const text of textStream) {
      fullText += text;
      setMessages([
        ...newMessages,
        { role: "assistant", content: fullText, id: newMessages.length },
      ]);
    }

    const results = await toolResults;

    if (results.length) {
      setMessages([
        ...newMessages,
        {
          role: "tool",
          content: results,
          id: newMessages.length,
        },
      ]);
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
    setInputValue(
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content),
    );

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
    if (typeof messages[lastUserMessageIndex].content === "string") {
      await handleSend(
        e,
        messagesUpToLastUser,
        messages[lastUserMessageIndex].content,
      );
    }
  };

  const handleModelSelect = (modelSelected: string) => {
    setModelProvider(getProviderFromModel(modelSelected));
    setModel(modelSelected);
  };

  useEffect(() => {
    if (tswPanelFooterRef.current) {
      setFooterWidth(
        `${tswPanelFooterRef.current.getBoundingClientRect().width}px`,
      );
    }
  }, [tswPanelFooterRef.current]);

  return (
    <>
      <div className={chatStyles.chatContainer} id="tsw-chat-container">
        <div className={chatStyles.chatContent}>
          <ScrollArea className={chatStyles.scrollArea}>
            {messages.length === 0 && (
              <div className={chatStyles.welcomeMessage}>
                Hi, how can I help you?
              </div>
            )}
            {messages.map((m, index) => (
              <div key={m.id}>
                {m.role === "user" && (
                  <UserMessage
                    message={m}
                    onCopy={copyToClipboard}
                    onEdit={handleEdit}
                  />
                )}

                {m.role === "assistant" && (
                  <AssistantMessage
                    message={m}
                    onCopy={copyToClipboard}
                    onSetMessage={setMessages}
                    onRefresh={handleRefresh}
                    isStreaming={isStreaming}
                    messagesLength={messages.length}
                    messageIndex={index}
                    editingMessageId={editingMessageId}
                  />
                )}
                {m.role === "tool" && <ToolMessage message={m} />}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      <div
        className={chatStyles.tswPanelFooter}
        id="tsw-panel-footer"
        ref={tswPanelFooterRef}
      >
        <ToolsSelect
          tools={tools}
          onChange={(tools) => {
            setTools(tools);
          }}
          width={footerWidth}
        />
        <div className={chatStyles.tswTextAreaContent}>
          <div className={chatStyles.inputContainer}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setInputValue(newValue);
                if (newValue.startsWith("? ") || newValue.startsWith("？ ")) {
                  loadInstantInputs();
                  const textarea = textareaRef.current;
                  if (textarea) {
                    setShowInstantInput(true);
                  }
                } else {
                  setShowInstantInput(false);
                }

                const textarea = e.target as HTMLTextAreaElement;
                textarea.style.height = "auto";
                textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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
            {showInstantInput && (
              <DropdownMenu
                open={showInstantInput}
                onOpenChange={setShowInstantInput}
              >
                <DropdownMenuTrigger asChild>
                  <div style={{ display: "none" }} />
                </DropdownMenuTrigger>
                {instantInputs.length > 0 && (
                  <DropdownMenuContent
                    className={textselectStyles.tswActionList}
                    style={{
                      position: "fixed",
                      top: `${textareaRef.current?.getBoundingClientRect().top - Math.min(instantInputs.length * 37 + 15, 2000)}px`,
                      left: `${textareaRef.current?.getBoundingClientRect().left}px`,
                      width: `${textareaRef.current?.getBoundingClientRect().width}px`,
                      overflowY: "auto",
                      zIndex: "1000",
                    }}
                    sideOffset={0}
                    alignOffset={0}
                    forceMount
                  >
                    <SelectInstantInput
                      instantInputs={instantInputs}
                      onSelect={(instantInput) => {
                        setInputValue(instantInput);
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }, 0);
                        setShowInstantInput(false);
                      }}
                    />
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            )}
            <div className={chatStyles.editActions}>
              <div>
                <ModelMenu
                  onSelect={(model) => handleModelSelect(model)}
                  currentModel={model}
                />
              </div>
              <div className={chatStyles.tswActionBtnGroup}>
                {editingMessageId !== null && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={chatStyles.tswActionBtn}
                      onClick={handleCancelEdit}
                    >
                      <SquareX size="16" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={chatStyles.tswActionBtn}
                      onClick={(e) => handleEditSubmit(e)}
                    >
                      <IterationCcw size="16" />
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
              <ExportDialog
                content={messages
                  .map(
                    (m) =>
                      `${m.role.toUpperCase()}:\n ${formatMessageContent(m.content)}`,
                  )
                  .join("\n\n")}
                elementId="tsw-chat-container"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
