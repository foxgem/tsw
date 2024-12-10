"use client";

import { useEffect, useState } from "react";
import { MODELS } from "~utils/constants";
import styles from "../css/modelselect.module.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  onSelect: (model: string) => void;
}

interface ModelGroups {
  gemini: string[];
  groq: string[];
}

export default function ModelMenu({ onSelect }: Readonly<Props>) {
  const [models, setModels] = useState<ModelGroups>({ gemini: [], groq: [] });
  const [currentModel, setCurrentModel] = useState<string>();

  const loadModels = async () => {
    setModels(MODELS);
    if (!currentModel) {
      setCurrentModel(MODELS.gemini[0]);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleselectItemClick = (selectItem: string) => {
    setCurrentModel(selectItem);
    onSelect(selectItem);
  };

  useEffect(() => {
    if (currentModel && models.gemini.length > 0) {
      const modelExists = [...models.gemini, ...models.groq].includes(
        currentModel,
      );
      if (!modelExists) {
        setCurrentModel(models.gemini[0]);
        onSelect(models.gemini[0]);
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
            {Object.entries(models).map(([groupName, options]) => (
              <SelectGroup key={groupName}>
                <SelectLabel className={styles.tswModelLabel}>
                  {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                </SelectLabel>
                {options.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className={styles.tswModelItem}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
