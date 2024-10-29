import logo from "data-base64:/assets/icon.png";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { iconArray } from "~/content";
import { ActionIcon } from "./ActionIcon";
import { chatWithPage } from "~utils/ai";
import type { CoreMessage } from "ai";
import { marked } from "marked";

export interface ChattingPanelProps {
  pageText: string;
  onRender: () => void;
}

export function TSWChattingPanel({ pageText, onRender }: ChattingPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<CoreMessage[]>([]);

  useEffect(() => {
    if (onRender) {
      onRender();
    }
  }, [onRender]);

  const submitClick = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMessages([...newMessages, { role: "assistant", content: fullText }]);
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
        <div id="tsw-output-body">
          <p>assistant: hi, how can I help you?</p>
          {messages.length > 0 &&
            messages.map((m, i) => {
              return (
                <p key="m-{i}">
                  {m.role}:
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
          className="tsw-panel-input"
        />
        <Button
          type="submit"
          className="tsw-panel-footer-btn"
          onClick={submitClick}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
