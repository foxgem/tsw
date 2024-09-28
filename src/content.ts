import { createWarningPopup } from "./WarningPopup";
import { explainSentence, explainWord, summariseLink } from "./utils/ai";
import CodeWrapper from "./components/CodeWrapper";
import React from "react";
import { createRoot } from "react-dom/client";
import { LOGO_SVG } from "./utils/constants";

let rightPart: HTMLElement | null = null;
let originalContent: string | null = null;

function addStyles() {
  if (!document.querySelector("style[data-tsw-styles]")) {
    const style = document.createElement("style");
    style.setAttribute("data-tsw-styles", "");
    style.textContent = `
      .tsw-code-wrapper {
        /* Add your styles for tsw-code-wrapper here */
      }
    `;
    document.head.appendChild(style);
  }
}

const findAllCodeBlocks = () => {
  if (window.location.hostname === "github.com") {
    const block = document.getElementById("read-only-cursor-text-area");
    return block ? [block] : [];
  } else if (window.location.hostname === "gist.github.com") {
    const table = document.querySelector("table.highlight");
    return table ? [table] : [];
  }
  return document.getElementsByTagName("code");
};

const wrapLongCodeBlocks = () => {
  const codeBlocks = findAllCodeBlocks();

  if (codeBlocks.length === 0) {
    return;
  }

  addStyles();

  const processCodeBlock = (codeBlock: Element) => {
    if (!codeBlock || codeBlock.parentElement?.classList.contains("tsw-code-wrapper")) {
      return;
    }

    const codeText = codeBlock.textContent;
    if (!codeText) {
      return;
    }

    const lines = codeText.split("\n");

    if (lines.length > 5) {
      const codeBlockContainer = document.createElement("div");
      codeBlockContainer.style.position = "relative";
      codeBlock.parentNode?.insertBefore(codeBlockContainer, codeBlock);
      codeBlockContainer.appendChild(codeBlock);

      let floatingButton: HTMLElement | null = null;

      const showFloatingButton = () => {
        if (!floatingButton) {
          floatingButton = document.createElement("div");
          floatingButton.className = "tsw-floating-button";
          floatingButton.innerHTML = LOGO_SVG;
          floatingButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          `;
          codeBlockContainer.appendChild(floatingButton);

          floatingButton.addEventListener("click", () => {
            const containerDiv = document.createElement("div");
            containerDiv.className = "tsw-code-container";
            codeBlockContainer.insertBefore(containerDiv, codeBlock);
            containerDiv.appendChild(codeBlock);

            const root = createRoot(containerDiv);
            root.render(
              React.createElement(CodeWrapper, {
                originCodes: codeText,
                codeBlock: window.location.hostname.includes("github.com")
                  ? codeBlock.outerHTML
                  : codeBlock.innerHTML,
              })
            );

            floatingButton?.remove();
            floatingButton = null;
            codeBlockContainer.removeEventListener("mouseenter", showFloatingButton);
            codeBlockContainer.removeEventListener("mouseleave", hideFloatingButton);
          });
        }
        floatingButton.style.opacity = "1";
      };

      const hideFloatingButton = () => {
        if (floatingButton) {
          floatingButton.style.opacity = "0";
        }
      };

      codeBlockContainer.addEventListener("mouseenter", showFloatingButton);
      codeBlockContainer.addEventListener("mouseleave", hideFloatingButton);
    }
  };

  for (let i = 0; i < codeBlocks.length; i++) {
    processCodeBlock(codeBlocks[i]);
  }
};

const createOrUpdateSplitView = (rightContent: string, leftWidth = 60, rightWidth = 40) => {
  if (!originalContent) {
    originalContent = document.body.innerHTML;
  }

  if (!rightPart) {
    const leftPart = createPart("left", leftWidth);
    leftPart.innerHTML = originalContent;

    rightPart = createPart("right", rightWidth);

    document.body.innerHTML = "";
    document.body.appendChild(leftPart);
    document.body.appendChild(rightPart);
  }

  rightPart.innerHTML = rightContent;

  const closeButton = rightPart.querySelector("#tsw-close-right-part");
  if (closeButton) {
    closeButton.addEventListener("click", closeSplitView);
  }
};

const closeSplitView = () => {
  if (rightPart && originalContent) {
    document.body.removeChild(rightPart);
    rightPart = null;
    document.body.innerHTML = originalContent;
    originalContent = null;
  }
};

const summarize = async () => {
  createOrUpdateSplitView(`
    <div  class="tsw-panel"">
      <button id="tsw-close-right-part">Close</button>
      <div id="tsw-summary-content">
        <div style="text-align: center; padding: 20px;">
          <div class="loading-spinner"></div>
          <p>Summarizing...</p>
        </div>
      </div>
    </div>
  `);

  const summaryContent = await summariseLink(window.location.href);
  const summaryElement = document.getElementById("tsw-summary-content");
  if (summaryElement) {
    summaryElement.innerHTML = summaryContent;
  }
};

let warningTimeout: number | undefined;
let closeTimeout: number | undefined;

const handleTimer = (remainingTime: number, domain: string) => {
  clearTimeout(warningTimeout);
  clearTimeout(closeTimeout);

  if (remainingTime > 10) {
    warningTimeout = window.setTimeout(
      showWarning,
      (remainingTime - 10) * 1000
    ) as unknown as number;
  } else {
    showWarning();
  }

  closeTimeout = window.setTimeout(() => {
    chrome.runtime.sendMessage({ action: "closePage", domain });
  }, remainingTime * 1000) as unknown as number;
};

const createPart = (side: "left" | "right", width: number) => {
  const part = document.createElement("div");
  part.style.cssText = `
    position: fixed;
    top: 0;
    ${side}: 0;
    width: ${width}%;
    height: 100%;
    z-index: 9999;
    overflow: auto;
    ${side === "right" ? "background-color: white; color: black;" : ""}
  `;
  return part;
};

const explainSelected = async (text: string) => {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";
  createOrUpdateSplitView(`
    <div class="tsw-panel">
      <p class="tsw-panel-title">${title}：${text}</p>
      <hr>
      <div id="tsw-explanation-content">
        <div style="text-align: center; padding: 20px;">
          <div class="loading-spinner"></div>
          <p>Explaining...</p>
        </div>
      </div>
      <button id="tsw-close-right-part" style="" >Close</button>
    </div>
  `);

  const explanation = isWord ? await explainWord(text) : await explainSentence(text);

  const explanationElement = document.getElementById("tsw-explanation-content");
  if (explanationElement) {
    explanationElement.innerHTML = explanation;
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "explainSelected":
      if (request.text) {
        explainSelected(request.text);
      }
      break;
    case "summarize":
      summarize();
      break;
    case "startTimer":
      handleTimer(request.remainingTime, request.domain);
      break;
    case "showWarning":
      showWarning();
      break;
    case "stopTimer":
      clearTimeout(warningTimeout);
      clearTimeout(closeTimeout);
      break;
    case "wrapCodeBlocks":
      wrapLongCodeBlocks();
      break;
  }
});

const showWarning = () => {
  let popupContainer = document.getElementById("tsw-warning-popup-container");
  if (!popupContainer) {
    popupContainer = document.createElement("div");
    popupContainer.id = "tsw-warning-popup-container";
    document.body.appendChild(popupContainer);
  }

  const handleDismiss = () => {
    if (popupContainer && popupContainer.firstChild) {
      (popupContainer.firstChild as HTMLElement).style.transform = "translateY(-100%)";
      setTimeout(() => {
        popupContainer?.parentNode?.removeChild(popupContainer);
      }, 300);
    }
  };

  const warningElement = createWarningPopup(handleDismiss);
  popupContainer.appendChild(warningElement);
};
