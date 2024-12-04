"use client";

import { useEffect, useState } from "react";
import styles from "../css/promptselect.module.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  category: string;
  onSelect: (action: any) => void;
}

const defaultCommand = {
  name: "Default",
  options: {},
};

export default function SystemPromptMenu({
  category,
  onSelect,
}: Readonly<Props>) {
  const [commands, setCommands] = useState([]);
  const [currentCommand, setCurrentCommand] = useState<string>();

  const loadCommands = async () => {
    const commands = []; //await loadCommandsFromStorage(category);
    commands.unshift(defaultCommand);
    setCommands(commands);
    if (!currentCommand) {
      setCurrentCommand(commands[0].name);
    }
  };

  useEffect(() => {
    loadCommands();
  }, [category]);

  const handleselectItemClick = (selectItem: string) => {
    setCurrentCommand(selectItem);

    const selectedCommand = commands.find((cmd) => cmd.name === selectItem);
    if (selectedCommand) {
      onSelect(selectedCommand);
    }
  };

  useEffect(() => {
    if (currentCommand && commands.length > 0) {
      const commandExists = commands.some((cmd) => cmd.name === currentCommand);
      if (!commandExists) {
        setCurrentCommand(commands[0].name);
        onSelect(commands[0]);
      }
    }
  }, [commands, currentCommand]);

  return (
    <div className={styles.tswMenuContainer}>
      {currentCommand && (
        <Select
          value={currentCommand}
          onValueChange={(value) => handleselectItemClick(value)}
        >
          <SelectTrigger
            className={styles.tswTriggerButton}
            onClick={() => loadCommands()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={styles.tswPromptList}>
            {commands.map((option) => (
              <SelectItem
                key={option.name}
                value={option.name}
                className={styles.tswPromptItem}
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
