import type { CoreTool } from "ai";
import { geomap } from "./geomap";
import { weather } from "./weather";

export interface Tool {
  handler: CoreTool;
  render?: (props: Record<string, any>) => JSX.Element;
}

export type Tools = Record<string, Tool>;

export const AVAILABLE_TOOLS: Tools = {
  weather,
  geomap,
};
