import React from "react";
import { createRoot } from "react-dom/client";
import { TSWPanel } from "./components/TSWPanel";
import { iconArray } from "./content";
import {
  explainCode,
  explainSentence,
  explainWord,
  ocr,
  rewriteCode,
  summariseLink,
} from "./utils/ai";
import { TSWChattingPanel } from "~components/TSWChattingPanel";

function withOutputPanel(
  outputElm: string,
  placeHolder: string,
  title: string,
  handler: () => void,
) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = "";

  const root = createRoot(panel);
  root.render(
    React.createElement(TSWPanel, {
      title: title,
      placeHolder: placeHolder,
      onRender: () => {
        const closeButton = document.querySelector("#tsw-close-right-part");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            panel.style.display = "none";
          });
        }

        for (const icon of iconArray) {
          const button = document.querySelector(
            `#tsw-${icon.name.toLowerCase()}-btn`,
          );
          if (button) {
            button.addEventListener("click", () => {
              icon.action();
              if (icon.name.toLowerCase() === "wand") {
                panel.style.display = "none";
              }
            });
          }
        }

        handler();
      },
    }),
  );
}

export async function summarize(outputElm: string) {
  withOutputPanel(outputElm, "Summarizing", "Summary", async () => {
    const summaryElement = document.getElementById("tsw-output-body");
    if (summaryElement) {
      await summariseLink(document.body.innerHTML, summaryElement);
    }
  });
}

export async function explainSelected(outputElm: string, text: string) {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";

  withOutputPanel(outputElm, "Explaining", `${title}：${text}`, async () => {
    const explanationElement = document.getElementById("tsw-output-body");
    if (explanationElement) {
      isWord
        ? await explainWord(text, explanationElement)
        : await explainSentence(text, explanationElement);
    }
  });
}

export async function ocrHandler(
  outputElm: string,
  imgSrc: string,
  postPrompt = "",
) {
  withOutputPanel(outputElm, "Processing", "Text in Image", async () => {
    const imgContentElement = document.getElementById("tsw-output-body");
    if (imgContentElement) {
      try {
        await ocr(imgSrc, imgContentElement, postPrompt);
      } catch (e) {
        imgContentElement.innerHTML = e as string;
      }
    }
  });
}

export function codeHandler(outputElm: string, code: string) {
  withOutputPanel(
    outputElm,
    "Explaining",
    "Code Block Explanation",
    async () => {
      const codeContentElement = document.getElementById("tsw-output-body");
      if (codeContentElement) {
        await explainCode(code, codeContentElement);
      }
    },
  );
}

export function rewriteHandler(
  outputElm: string,
  code: string,
  targetLanguage: string,
) {
  withOutputPanel(
    outputElm,
    "Rewriting",
    `Rewrite Code with ${targetLanguage}`,
    async () => {
      const codeContentElement = document.getElementById("tsw-output-body");
      if (codeContentElement) {
        await rewriteCode(code, targetLanguage, codeContentElement);
      }
    },
  );
}

export function chattingHandler(outputElm: string) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = "";

  const root = createRoot(panel);
  root.render(
    React.createElement(TSWChattingPanel, {
      pageText: document.body.innerHTML,
      onRender: () => {
        const closeButton = document.querySelector("#tsw-close-right-part");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            panel.style.display = "none";
          });
        }

        for (const icon of iconArray) {
          const button = document.querySelector(
            `#tsw-${icon.name.toLowerCase()}-btn`,
          );
          if (button) {
            button.addEventListener("click", () => {
              icon.action();
              if (icon.name.toLowerCase() === "wand") {
                panel.style.display = "none";
              }
            });
          }
        }
      },
    }),
  );
}
