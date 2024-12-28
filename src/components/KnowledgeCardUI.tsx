"use client";
import { marked } from "marked";
import { useEffect, useState } from "react";
import chatStyles from "~/css/chatui.module.css";
import { generateKnowledgeCard } from "~ai/ai";
import KnowledgeCard, { type KnowledgeCardData } from "./KnowledgeCard";
import { Loading } from "./Loading";

marked.setOptions({
  breaks: true,
});

export interface KnowledgeUICardProps {
  readonly pageRoot: HTMLElement;
  readonly pageURL: string;
}

export function KnowledgeCardUI({ pageRoot, pageURL }: KnowledgeUICardProps) {
  const [knowledgeCardData, setKnowledgeCardData] =
    useState<KnowledgeCardData>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateKnowledgeCardData = async () => {
      try {
        const result = await generateKnowledgeCard(pageRoot);
        console.log(result);
        setKnowledgeCardData(result);
      } finally {
        setIsLoading(false);
      }
    };

    void generateKnowledgeCardData();
  }, [pageRoot]);

  return (
    <>
      <div className={chatStyles.knowledgeContainer}>
        {isLoading ? (
          <Loading message="Generating" />
        ) : (
          knowledgeCardData && <KnowledgeCard data={knowledgeCardData} />
        )}
      </div>
    </>
  );
}
