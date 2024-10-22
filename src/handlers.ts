import TSWIcon from "./components/TSWIcon";
import { iconArray } from "./content";
import {
  explainCode,
  explainSentence,
  explainWord,
  ocr,
  pageRag,
  rewriteCode,
  summariseLink,
} from "./utils/ai";
import logo from "data-base64:/assets/icon.png";

let pageText: string;

function withOutputPanel(
  outputElm: string,
  initInnerHtml: string,
  title: string,
  handler: () => void,
) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = `
    <div  class="tsw-panel"">
        <div class="tsw-panel-header">
            <div class="tsw-panel-header-logo"> <img src=${logo} alt="TSW Icon" class="tsw-icon">
            <span>${title}</span>
              </div>
            <div class="tsw-panel-menu">
                <div class="tsw-panel-header-action">
                ${iconArray
                  .map(
                    (icon) => `
                    <button class="tsw-header-btn" id="tsw-${icon.name.toLowerCase()}-btn">
                    ${icon.svg}
                    </button>
                `,
                  )
                  .join("")}
                </div>
                <div class="tsw-panel-header-separator"></div>
                <button id="tsw-close-right-part"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg></button>
            </div>
        </div>
        ${initInnerHtml}
    </div>
  `;

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
}

function extractTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() || "";
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;

    // List of tags to exclude
    const excludeTags = [
      "SCRIPT",
      "STYLE",
      "IFRAME",
      "NOSCRIPT",
      "SVG",
      "PATH",
    ];

    if (excludeTags.includes(element.tagName)) {
      return "";
    }

    // Optional: Check for hidden elements
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return "";
    }

    let text = "";
    for (const childNode of element.childNodes) {
      text += `${extractTextFromNode(childNode)} `;
    }
    return text.trim();
  }

  return "";
}

// Ensure the function is used somewhere to avoid the "never used" warning
export { extractTextFromNode };

export async function summarize(outputElm: string) {
  withOutputPanel(
    outputElm,
    `
    <hr>
    <div id="tsw-summary-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Summarizing...</p>
      </div>
    </div>
  `,
    "Summary",
    async () => {
      const summaryElement = document.getElementById("tsw-summary-content");
      if (summaryElement) {
        await summariseLink(window.location.href, (text) => {
          summaryElement.innerHTML = text;
        });
      }
    },
  );
}

export async function explainSelected(outputElm: string, text: string) {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";

  withOutputPanel(
    outputElm,
    `
    <hr>
    <div id="tsw-explanation-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Explaining...</p>
      </div>
    </div>
    `,
    `${title}：${text}`,
    async () => {
      const explanationElement = document.getElementById(
        "tsw-explanation-content",
      );
      if (explanationElement) {
        const linePrinter = (text: string) => {
          explanationElement.innerHTML = text;
        };
        isWord
          ? await explainWord(text, linePrinter)
          : await explainSentence(text, linePrinter);
      }

      // if (!pageText) {
      //   pageText = extractTextFromNode(document.body);
      // }
      // console.log(
      //   "page based rag: ",
      //   await pageRag(
      //     "if I want to search similar topic articles with google, what keywords would you like to suggest?",
      //     pageText
      //   )
      // );
    },
  );
}

export async function ocrHandler(
  outputElm: string,
  imgSrc: string,
  postPrompt = "",
) {
  withOutputPanel(
    outputElm,
    `
    <hr>
    <div id="tsw-image-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Processing...</p>
      </div>
    </div>
    `,
    "Text in Image",
    async () => {
      const imgContentElement = document.getElementById("tsw-image-content");
      if (imgContentElement) {
        try {
          await ocr(
            imgSrc,
            (text) => {
              imgContentElement.innerHTML = text;
            },
            postPrompt,
          );
        } catch (e) {
          imgContentElement.innerHTML = e as string;
        }
      }
    },
  );
}

export function codeHandler(outputElm: string, code: string) {
  withOutputPanel(
    outputElm,
    `
    <hr>
    <div id="tsw-code-explanation">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Explaining...</p>
      </div>
    </div>
    `,
    "Code Block Explanation",
    async () => {
      const codeContentElement = document.getElementById(
        "tsw-code-explanation",
      );
      if (codeContentElement) {
        await explainCode(code, (text) => {
          codeContentElement.innerHTML = text;
        });
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
    `
    <hr>
    <div id="tsw-code-result">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Rewriting...</p>
      </div>
    </div>
    `,
    `Rewrite Code with ${targetLanguage}`,
    async () => {
      const codeContentElement = document.getElementById("tsw-code-result");
      if (codeContentElement) {
        await rewriteCode(code, targetLanguage, (text) => {
          codeContentElement.innerHTML = text;
        });
      }
    },
  );
}
