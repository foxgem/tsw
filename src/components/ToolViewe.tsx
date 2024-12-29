import type * as React from "react";
import { AVAILABLE_TOOLS } from "~ai/tools";

export interface ToolResult {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  result: any;
}

interface ToolsResultsProps {
  results: ToolResult[];
}

export const ToolViews: React.FC<ToolsResultsProps> = ({ results }) => {
  const renderToolResult = (data: ToolResult, index: number) => {
    if (!data) return null;

    if (data.result?.error) {
      return (
        <div className="errorMessage" key={index}>
          {data.result.error}
        </div>
      );
    }

    const tool = AVAILABLE_TOOLS[data.toolName];
    if (!tool) return null;

    if (!tool.render) {
      return JSON.stringify(data.result);
    }

    return (
      <div key={data.toolCallId} className="toolResultItem">
        {" "}
        {tool.render(data.result)}
      </div>
    );
  };

  return (
    <div>{results.map((result, index) => renderToolResult(result, index))}</div>
  );
};
