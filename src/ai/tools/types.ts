import type { CoreTool } from "ai";
import type { z } from "zod";

export interface Tool {
  name: string;
  settingsSchema?: () => z.ZodSchema;
  createCoreTool: (settings?: Record<string, any>) => CoreTool;
  render?: (props: Record<string, any>) => JSX.Element;
}

export interface ToolConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

export type Tools = Record<string, Tool>;
