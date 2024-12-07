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
import { DEFAULT_GEMINI_MODEL } from "~utils/constants";

interface Props {
  category: string;
  onSelect: (action: any) => void;
}

export default function ModelMenu({ category, onSelect }: Readonly<Props>) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState<string>();

  const loadModels = async () => {
    const models = ["gemini-1.5-flash-8b", "gemini-1.5-pro"]; //await loadCommandsFromStorage(category);
    models.unshift(DEFAULT_GEMINI_MODEL);
    setModels(models);
    if (!currentModel) {
      setCurrentModel(models[0]);
    }
  };

  useEffect(() => {
    loadModels();
  }, [category]);

  const handleselectItemClick = (selectItem: string) => {
    setCurrentModel(selectItem);

    const selectedModel = models.find((cmd) => cmd === selectItem);
    if (selectedModel) {
      onSelect(selectedModel);
    }
  };

  useEffect(() => {
    if (currentModel && models.length > 0) {
      const modelExists = models.some((cmd) => cmd === currentModel);
      if (!modelExists) {
        setCurrentModel(models[0]);
        onSelect(models[0]);
      }
    }
  }, [models, currentModel]);

  return (
    <div className={styles.tswMenuContainer}>
      {currentModel && (
        <Select
          value={currentModel}
          onValueChange={(value) => handleselectItemClick(value)}
        >
          <SelectTrigger
            className={styles.tswTriggerButton}
            onClick={() => loadModels()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={styles.tswPromptList}>
            {models.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className={styles.tswPromptItem}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
