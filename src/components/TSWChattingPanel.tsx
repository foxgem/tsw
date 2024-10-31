import logo from "data-base64:/assets/icon.png";
import type { CoreMessage } from "ai";
import { marked } from "marked";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { iconArray } from "~/content";
import { upperCaseFirstLetter } from "~lib/utils";
import { chatWithPage } from "~utils/ai";
import { FEATHER_SVG } from "~utils/constants";
import { ActionIcon } from "./ActionIcon";

export interface ChattingPanelProps {
  pageText: string;
  onRender: () => void;
}

export function TSWChattingPanel({ pageText, onRender }: ChattingPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (onRender) {
      onRender();
    }
  }, [onRender]);

  useEffect(() => {
    const chatBody = document.getElementById("tsw-output-body");
    const header = document.querySelector(".tsw-panel-header");
    const footer = document.querySelector(".tsw-panel-footer");

    if (chatBody && header && footer) {
      const headerHeight = header.getBoundingClientRect().height;
      const footerHeight = footer.getBoundingClientRect().height;
      const newHeight = `calc(100vh - ${headerHeight + footerHeight + 5}px)`;
      chatBody.style.height = newHeight;
    }
  }, []);

  useLayoutEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [autoScroll]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      setAutoScroll(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  const submitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim()) return;

    setIsSubmitting(true);
    try {
      const newMessages: CoreMessage[] = [
        ...messages,
        { content: inputValue, role: "user" },
      ];
      setInputValue("");
      setMessages(newMessages);
      const textStream = await chatWithPage(newMessages, pageText);
      let fullText = "";

      for await (const text of textStream) {
        fullText += text;
        setMessages([
          ...newMessages,
          { role: "assistant", content: fullText + FEATHER_SVG },
        ]);
      }
      setMessages([...newMessages, { role: "assistant", content: fullText }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tsw-panel">
      <div className="tsw-panel-header">
        <div className="tsw-panel-header-logo">
          <img src={logo} alt="TSW Icon" className="tsw-icon" />
          <span>Chatting With Page</span>
        </div>
        <div className="tsw-panel-menu">
          <div className="tsw-panel-header-action">
            {iconArray.map((icon) => (
              <button
                type="button"
                className="tsw-header-btn"
                id={`tsw-${icon.name.toLowerCase()}-btn`}
                key={icon.name}
              >
                <ActionIcon name={icon.name} />
              </button>
            ))}
          </div>
          <div className="tsw-panel-header-separator" />
          <button id="tsw-close-right-part" type="button">
            <ActionIcon name="Close" />
          </button>
        </div>
      </div>
      <div className="tsw-panel-content">
        <div
          id="tsw-output-body"
          className="tsw-chat-body"
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <p className="tsw-chat-item tsw-chat-item-single">
            <ActionIcon name="Assistant" />
            <p>hi, how can I help you?</p>
          </p>
          {messages.length > 0 &&
            messages.map((m, i) => {
              return (
                <p
                  key={`m-${`k${i}`}`}
                  className={`tsw-chat-item ${
                    String(m.content).split("\n").length === 1
                      ? "tsw-chat-item-single"
                      : ""
                  } ${m.role === "user" ? "tsw-chat-item-user" : "tsw-chat-item-assistant"}`}
                >
                  <div className={m.role === "user" ? "tsw-user" : ""}>
                    <ActionIcon name={upperCaseFirstLetter(m.role)} />
                  </div>

                  <p
                    dangerouslySetInnerHTML={{
                      __html: marked(m.content as string),
                    }}
                  />
                </p>
              );
            })}
        </div>
      </div>
      <div className="tsw-panel-footer">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              submitClick(e);
            }
          }}
          className="tsw-panel-input"
        />
      </div>
    </div>
  );
}
