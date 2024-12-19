import { Sparkles } from "lucide-react";
import { AVAILABLE_TOOLS, type Tool, type Tools } from "~ai/tools";
import { upperCaseFirstLetter } from "~lib/utils";
import { enableTools } from "~utils/toolsstorage";
import styles from "../css/chatui.module.css";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ToolsProps {
  tools: Tools;
  width: string;
  onChange: (tools: Tools) => void;
}

export function ToolsSelect({ tools, width, onChange }: ToolsProps) {
  const isToolSelected = (key: string) => {
    return tools ? key in tools : false;
  };

  const handleToolChange = (key: string, tool: Tool) => {
    if (isToolSelected(key)) {
      const newTools = { ...tools };
      delete newTools[key];

      enableTools(Object.keys(newTools));
      onChange(newTools);
    } else {
      const updatedTools = { ...tools, [key]: tool };
      enableTools(Object.keys(updatedTools));
      onChange(updatedTools);
    }
  };
  const handleToggleAll = () => {
    if (
      (tools ? Object.keys(tools).length : 0) ===
      Object.keys(AVAILABLE_TOOLS).length
    ) {
      onChange({});
      enableTools([]);
    } else {
      enableTools(Object.keys(AVAILABLE_TOOLS));
      onChange(AVAILABLE_TOOLS);
    }
  };

  return (
    <div className={styles.toolsContainer}>
      <Popover>
        <PopoverTrigger className={styles.toolsButton}>
          <Sparkles size="16" />
          Tools{" "}
          <span className={styles.toolsNumber}>
            ({tools ? Object.keys(tools).length : 0})
          </span>
        </PopoverTrigger>
        <PopoverContent>
          <div className={styles.toolsContent} style={{ width: width }}>
            <div className={styles.toolsTitle}>
              <h2 className={styles.toolName}>Available Tools</h2>
              <a onClick={handleToggleAll} style={{ cursor: "pointer" }}>
                {(tools ? Object.keys(tools).length : 0) ===
                Object.keys(AVAILABLE_TOOLS).length
                  ? "Disable All"
                  : "Enable All"}
              </a>
            </div>
            <div className={styles.toolsList}>
              {Object.entries(AVAILABLE_TOOLS).map(([key, tool]) => (
                <label key={key} className={styles.toolItem}>
                  <input
                    type="checkbox"
                    checked={isToolSelected(key)}
                    onChange={() => handleToolChange(key, tool)}
                  />
                  <span className={styles.toolName}>
                    {upperCaseFirstLetter(key)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
