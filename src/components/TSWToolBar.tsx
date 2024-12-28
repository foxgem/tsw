import { CircleStop } from "lucide-react";
import chatStyles from "~/css/chatui.module.css";
import { formatMessageContent } from "~lib/utils";
import type { Message } from "./ChatUI";
import { ExportDialog } from "./ExportDialog";
import { Button } from "./ui/button";

interface TSWToolBarProps {
  isThinking: boolean;
  messages?: Message[];
  onStop?: () => void;
  exportTitle?: string;
}

export function TSWToolBar({
  isThinking,
  onStop,
  messages,
  exportTitle,
}: TSWToolBarProps) {
  return (
    <>
      {isThinking ? (
        <div className={chatStyles.tswToolBar}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className={chatStyles.tswActionBtn}
          >
            <CircleStop className={chatStyles.stopIcon} />
          </Button>
        </div>
      ) : messages?.length > 0 && messages[messages.length - 1].isComplete ? (
        <div className={chatStyles.tswToolBar}>
          <ExportDialog
            content={messages
              .map(
                (m) =>
                  `${m.role.toUpperCase()}:\n ${formatMessageContent(m.content)}`,
              )
              .join("\n\n")}
            elementId="tsw-chat-container"
            title={exportTitle}
          />
        </div>
      ) : null}
    </>
  );
}
