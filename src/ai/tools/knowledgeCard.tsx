import { tool } from "ai";
import { z } from "zod";
import { generateKnowledgeCard } from "~ai/ai";
import KnowledgeCard, {
  type KnowledgeCardData,
} from "~components/KnowledgeCard";

export const knowledgeCard = {
  handler: tool({
    description: "Display the knowledge card",
    parameters: z.object({}),
    execute: async () => {
      const result = await generateKnowledgeCard(document.body);
      return result;
    },
  }),
  render: (data: KnowledgeCardData) => {
    return <KnowledgeCard data={data} />;
  },
};
