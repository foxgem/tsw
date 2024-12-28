"use client";
import { tool } from "ai";
import { z } from "zod";
import { generateMindmap } from "~ai/ai";
import Mindmap, { type MindmapData } from "~components/Mindmap";

export const mindmap = {
  handler: tool({
    description: "Display the mindmap card",
    parameters: z.object({}),
    execute: async () => {
      const result = await generateMindmap(document.body);
      return result;
    },
  }),
  render: (data: MindmapData) => {
    return <Mindmap data={data} />;
  },
};
