"use client";

import { useEffect, useState } from "react";
import { ActionIcon } from "~/components/ActionIcon";
import { Button } from "~/components/ui/button";
import commontyles from "~/css/common.module.css";
import { cn } from "~lib/utils";
import { type QuickPrompt, readQuickPrompts } from "~utils/storage";
import styles from "../css/textselect.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  selectedText: string;
  position: { x: number; y: number };
  onSelect: (action: QuickPrompt) => void;
  onTranslate: () => void;
}
export default function TextSelectionMenu({
  selectedText,
  onSelect,
  position,
  onTranslate,
}: Readonly<Props>) {
  const [commands, setCommands] = useState<QuickPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadCommands = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const loadedCommands = await readQuickPrompts();
    setCommands(loadedCommands || []);
    setIsLoading(false);
  };

  const handleMenuItemClick = (menuItem: QuickPrompt) => {
    onSelect(menuItem);
  };

  const handleTranslateClick = () => {
    onTranslate();
  };

  useEffect(() => {
    if (selectedText) {
      loadCommands();
    }
  }, [selectedText]);

  if (!selectedText) return null;

  return (
    <div
      className={styles.tswMenuContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={commontyles.tswActionBtn}
        onClick={handleTranslateClick}
      >
        <ActionIcon name="Translate" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(commontyles.tswActionBtn, styles.tswTriggerButton)}
          >
            <ActionIcon name="Menu" />
          </Button>
        </DropdownMenuTrigger>
        {commands.length > 0 && (
          <DropdownMenuContent
            className={styles.tswActionList}
            side="bottom"
            align="start"
            sideOffset={5}
            alignOffset={-5}
          >
            {commands.map((command) => (
              <DropdownMenuItem
                key={command.name}
                className={styles.tswActionItem}
              >
                <Button onClick={() => handleMenuItemClick(command)}>
                  {" "}
                  {command.name}
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
