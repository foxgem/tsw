import { CopyIcon } from "lucide-react";
import { marked } from "marked";
import chatStyles from "~/css/chatui.module.css";
import iconsStyles from "~/css/icons.module.css";
import { type ToolResult, ToolViews } from "~ai/tools";
import { cn, upperCaseFirstLetter } from "~lib/utils";
import { ActionIcon } from "./ActionIcon";
import type { Message } from "./ChatUI";
import { StreamMessage } from "./StreamMessage";
import { Button } from "./ui/button";
import { RefreshIcon } from "./ui/icons/refresh";
import { SquarePenIcon } from "./ui/icons/square-pen";

interface UserMessageProps {
  message: Message;
  onCopy: (content: string) => void;
  onEdit: (message: any) => void;
}

interface AssistantMessageProps {
  message: Message;
  messagesLength: number;
  messageIndex: number;
  isStreaming?: boolean;
  editingMessageId: number | null;
  isThinking?: boolean;
  onCopy: (content: string) => void;
  onSetMessage?: (message: any) => void;
  onRefresh: (e: React.MouseEvent) => void;
}
interface ToolMessageProps {
  message: Message;
}

export const UserMessage = ({ message, onCopy, onEdit }: UserMessageProps) => {
  return (
    <>
      <div
        key={message.id}
        className={cn(chatStyles.messageContainer, chatStyles.userMessage)}
      >
        <div
          className={cn(
            chatStyles.chatItemContainer,
            chatStyles.userChatItem,
            chatStyles.tswChatItem,
            message.content.length < 100 ? chatStyles.tswChatItemSingle : "",
          )}
        >
          <div className={chatStyles.messageContent}>
            <p
              dangerouslySetInnerHTML={{
                __html: marked(message.content as string),
              }}
            />
          </div>
          <div className={chatStyles.tswUser}>
            <ActionIcon name={upperCaseFirstLetter(message.role)} />
          </div>
        </div>
        <div
          className={cn(
            chatStyles.actionContainer,
            chatStyles.userActionContainer,
          )}
        >
          {message.content && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={chatStyles.tswActionBtn}
                onClick={() => onCopy(JSON.stringify(message.content))}
              >
                <CopyIcon size={16} className={iconsStyles.dynamicIcon} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={chatStyles.tswActionBtn}
                onClick={() => onEdit(message)}
              >
                <SquarePenIcon size={16} className={iconsStyles.dynamicIcon} />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const AssistantMessage = ({
  message,
  messagesLength,
  messageIndex,
  isStreaming,
  editingMessageId,
  onCopy,
  onSetMessage,
  onRefresh,
}: AssistantMessageProps) => {
  return (
    <>
      <div
        key={message.id}
        className={cn(chatStyles.messageContainer, chatStyles.assistantMessage)}
      >
        <div
          className={cn(
            chatStyles.chatItemContainer,
            message.isError ? chatStyles.errorChatItem : "",
            chatStyles.tswChatItem,
            String(message.content).split("\n").length === 1 &&
              message.content.length < 100
              ? chatStyles.tswChatItemSingle
              : "",
          )}
        >
          <ActionIcon name={upperCaseFirstLetter("assistant")} />

          <div className={chatStyles.messageContent}>
            {message.content === "TSW" ? (
              <div className={chatStyles.loadingContainer}>
                <div className={chatStyles.loadingDot}>
                  <div className={chatStyles.dotBase} />
                  <div className={chatStyles.dotPing} />
                </div>
              </div>
            ) : (
              <StreamMessage
                outputString={message.content as string}
                onStreamComplete={(isComplete) => {
                  onSetMessage((prev) =>
                    prev.map((msg) =>
                      msg.id === message.id ? { ...msg, isComplete } : msg,
                    ),
                  );
                }}
              />
            )}
          </div>
          {message.role === "user" && (
            <div className={chatStyles.tswUser}>
              <ActionIcon name={upperCaseFirstLetter(message.role)} />
            </div>
          )}
        </div>
        <div
          className={cn(
            chatStyles.actionContainer,
            message.role === "user"
              ? chatStyles.userActionContainer
              : chatStyles.assistantActionContainer,
          )}
        >
          {message.isComplete && message.content && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={chatStyles.tswActionBtn}
                onClick={() => onCopy(JSON.stringify(message.content))}
              >
                <CopyIcon size={16} className={iconsStyles.dynamicIcon} />
              </Button>

              {messageIndex === messagesLength - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={chatStyles.tswActionBtn}
                  onClick={(e) => onRefresh(e)}
                  disabled={isStreaming || editingMessageId !== null}
                >
                  <RefreshIcon size={16} className={iconsStyles.dynamicIcon} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const ToolMessage = ({ message }: ToolMessageProps) => {
  return (
    <>
      <div
        key={message.id}
        className={cn(chatStyles.messageContainer, chatStyles.assistantMessage)}
      >
        <div
          className={cn(chatStyles.chatItemContainer, chatStyles.tswChatItem)}
        >
          <ActionIcon name={upperCaseFirstLetter("assistant")} />
          <div className={chatStyles.messageContent}>
            <ToolViews
              key={message.id}
              results={
                Array.isArray(message.content) &&
                "toolCallId" in (message.content[0] || {})
                  ? (message.content as ToolResult[])
                  : []
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};
