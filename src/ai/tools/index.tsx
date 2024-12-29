import { ToolRegistry } from "./registry";
export * from "./types";

export const toolRegistry = new ToolRegistry();
toolRegistry.initialize();
