"use client";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { generateMindmap } from "~/ai/ai";
import chatStyles from "~/css/chatui.module.css";
import { Loading } from "./Loading";
import Mindmap, { type MindmapData } from "./Mindmap";

marked.setOptions({
  breaks: true,
});

export interface MindmapProps {
  readonly pageRoot: HTMLElement;
  readonly pageURL: string;
}

export function MindmapUI({ pageRoot, pageURL }: MindmapProps) {
  const [mindmapData, setMindmapData] = useState<MindmapData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pakoValue, setPakoValue] = useState(null);

  useEffect(() => {
    const generateMindmapData = async () => {
      try {
        const result = await generateMindmap(pageRoot);
        console.log(result);
        console.log(result.diagram);
        setMindmapData(result);
      } finally {
        setIsLoading(false);
      }
    };

    void generateMindmapData();
  }, [pageRoot]);

  return (
    <>
      <div className={chatStyles.mindmapContainer}>
        {isLoading ? (
          <Loading message="Generating" />
        ) : (
          mindmapData && (
            <Mindmap
              data={mindmapData}
              onGenerate={(pakoValue) => {
                setPakoValue(pakoValue);
              }}
            />
          )
        )}
      </div>
    </>
  );
}
