import { Sparkles } from "lucide-react";
import { toolRegistry, type Tool, type Tools } from "~ai/tools";
import { upperCaseFirstLetter } from "~lib/utils";
import styles from "../css/chatui.module.css";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

async function enableTools(toolNames: string[]) {
  const allTools = Object.keys(toolRegistry.getAllTools());

  for (const toolName of allTools) {
    await toolRegistry.enableTool(toolName, toolNames.includes(toolName));
  }
}

interface ToolsProps {
  tools: Tools;
  width: string;
  onChange: (tools: Tools) => void;
}

export function ToolsSelect({ tools, width, onChange }: ToolsProps) {
  const isToolSelected = (key: string) => {
    return tools ? key in tools : false;
  };

  const handleToolChange = async (key: string, tool: Tool) => {
    if (isToolSelected(key)) {
      const newTools = { ...tools };
      delete newTools[key];

      await enableTools(Object.keys(newTools));
      onChange(newTools);
    } else {
      const updatedTools = { ...tools, [key]: tool };
      await enableTools(Object.keys(updatedTools));
      onChange(updatedTools);
    }
  };

  const handleToggleAll = async () => {
    const allTools = toolRegistry.getAllTools();
    if (
      (tools ? Object.keys(tools).length : 0) === Object.keys(allTools).length
    ) {
      await enableTools([]);
      onChange({});
    } else {
      await enableTools(Object.keys(allTools));
      onChange(allTools);
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
        <PopoverContent style={{ zIndex: "1000" }}>
          <div className={styles.toolsContent} style={{ width: width }}>
            <div className={styles.toolsTitle}>
              <h2 className={styles.toolName}>Available Tools</h2>
              <a
                onClick={handleToggleAll}
                style={{ color: "black", cursor: "pointer" }}
              >
                {(tools ? Object.keys(tools).length : 0) ===
                Object.keys(toolRegistry.getAllTools()).length
                  ? "Disable All"
                  : "Enable All"}
              </a>
            </div>
            <div className={styles.toolsList}>
              {Object.entries(toolRegistry.getAllTools()).map(([key, tool]) => (
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
