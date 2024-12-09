"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MODEL } from "~utils/constants";
import styles from "../css/modelselect.module.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  category: string;
  onSelect: (model: string) => void;
}

export default function ModelMenu({ category, onSelect }: Readonly<Props>) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState<string>();

  const loadModels = async () => {
    const models = [
      DEFAULT_MODEL,
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
      "gemini-exp-1206",
    ]; //await loadCommandsFromStorage(category);
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
          <SelectContent className={styles.tswModelList}>
            {models.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className={styles.tswModelItem}
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
