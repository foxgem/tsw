import { marked } from "marked";
import chatStyles from "~/css/chatui.module.css";
import iconsStyles from "~/css/icons.module.css";
import { cn, upperCaseFirstLetter } from "~lib/utils";
import { ActionIcon } from "./ActionIcon";
import type { Message } from "./ChatUI";
import { CopyToClipboard } from "./CopyToClipboard";
import { StreamMessage } from "./StreamMessage";
import { type ToolResult, ToolViews } from "./ToolViewer";
import { Button } from "./ui/button";
import { RefreshIcon } from "./ui/icons/refresh";
import { SquarePenIcon } from "./ui/icons/square-pen";

interface UserMessageProps {
  message: Message;
  onEdit?: (message: any) => void;
  onSetMessage?: (message: any) => void;
  isChatMode?: boolean;
}

interface AssistantMessageProps {
  message: Message;
  messagesLength: number;
  messageIndex: number;
  isStreaming?: boolean;
  editingMessageId?: number | null;
  isThinking?: boolean;
  onSetMessage?: (message: any) => void;
  onRefresh?: (e: React.MouseEvent) => void;
}

interface ToolMessageProps {
  message: Message;
}

export const UserMessage = ({
  message,
  onEdit,
  onSetMessage,
  isChatMode = true,
}: UserMessageProps) => {
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
          <div
            className={cn(
              chatStyles.messageContent,
              message.isError ? chatStyles.errorChatItem : "",
            )}
          >
            {message.content === "TSW" ? (
              <div className={chatStyles.loadingContainer}>
                <div className={chatStyles.loadingDot}>
                  <div className={chatStyles.dotBase} />
                  <div className={chatStyles.dotPing} />
                </div>
              </div>
            ) : message.isError || isChatMode ? (
              <p
                dangerouslySetInnerHTML={{
                  __html: marked(message.content as string),
                }}
              />
            ) : (
              <StreamMessage
                outputString={message.content as string}
                onStreamComplete={(isComplete) => {
                  if (onSetMessage) {
                    onSetMessage((prev) =>
                      prev.map((msg) =>
                        msg.id === message.id ? { ...msg, isComplete } : msg,
                      ),
                    );
                  }
                }}
              />
            )}
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
              <CopyToClipboard
                content={JSON.stringify(message.content)}
                className={chatStyles.tswActionBtn}
              />
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={chatStyles.tswActionBtn}
                  onClick={() => onEdit(message)}
                >
                  <SquarePenIcon
                    size={16}
                    className={iconsStyles.dynamicIcon}
                  />
                </Button>
              )}
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
            chatStyles.tswChatItem,
            String(message.content).split("\n").length === 1 &&
              message.content.length < 100
              ? chatStyles.tswChatItemSingle
              : "",
          )}
        >
          <ActionIcon name={upperCaseFirstLetter("assistant")} />

          <div
            className={cn(
              chatStyles.messageContent,
              message.isError ? chatStyles.errorChatItem : "",
            )}
          >
            {message.content === "TSW" ? (
              <div className={chatStyles.loadingContainer}>
                <div className={chatStyles.loadingDot}>
                  <div className={chatStyles.dotBase} />
                  <div className={chatStyles.dotPing} />
                </div>
              </div>
            ) : message.isError ? (
              <p
                dangerouslySetInnerHTML={{
                  __html: marked(message.content as string),
                }}
              />
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
              <CopyToClipboard
                content={JSON.stringify(message.content)}
                className={chatStyles.tswActionBtn}
              />

              {messageIndex === messagesLength - 1 && onRefresh && (
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
