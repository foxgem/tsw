import { debounce } from "lodash";
import React from "react";
import { createRoot } from "react-dom/client";
import { createWarningPopup } from "./WarningPopup";
import CodeWrapper from "./components/CodeWrapper";
import { explainSentence, explainWord, summariseLink } from "./utils/ai";
import { LOGO_SVG } from "./utils/constants";
import ImgWrapper from "./components/ImgWrapper";

function addStyles() {
  if (!document.querySelector("style[data-tsw-styles]")) {
    const style = document.createElement("style");
    style.setAttribute("data-tsw-styles", "");
    style.textContent = `
      .tsw-code-wrapper {
        /* Add your styles for tsw-code-wrapper here */
        background-color:rgb(250, 250, 250);
        color:black;
      }
    `;
    document.head.appendChild(style);
  }
}

function createFloatingToggleButton() {
  const floatingButton = document.createElement("button");
  floatingButton.id = "tsw-floating-toggle";
  floatingButton.innerHTML = "TSW";
  floatingButton.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 10000;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `;

  const panel = document.createElement("div");
  panel.id = "tsw-toggle-panel";
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    right: 60px;
    transform: translateY(-50%);
    width: 40%;
    height: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    z-index: 9999;
    display: none;
  `;
  panel.innerHTML = "";

  floatingButton.addEventListener("click", () => {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  document.body.appendChild(floatingButton);
  document.body.appendChild(panel);
}

createFloatingToggleButton();

const findAllCodeBlocks = () => {
  if (window.location.hostname === "github.com") {
    const block = document.getElementById("read-only-cursor-text-area");
    return block ? [block] : [];
  } else if (window.location.hostname === "gist.github.com") {
    const table = document.querySelector("table.highlight");
    return table ? [table] : [];
  } else if (window.location.hostname === "medium.com") {
    const spanTags = document.querySelectorAll("pre > span");
    return Array.from(spanTags);
  }

  return document.getElementsByTagName("code");
};

const findAllImages = () => {
  const imgTags = document.getElementsByTagName("img");
  return Array.from(imgTags).filter((img) => {
    const src = img.getAttribute("src");
    const classes = img.className.split(" ");
    return (
      src &&
      src.trim() !== "" &&
      !classes.some((cls) => cls.startsWith("avatar") || cls.startsWith("icon")) &&
      img.width >= 200 &&
      img.height >= 200
    );
  });
};

const wrapTargetTags = () => {
  const createFloatingButton = (codeBlock: Element, reactComponent: React.ReactElement) => {
    const codeBlockContainer = document.createElement("div");
    codeBlockContainer.style.position = "relative";
    codeBlock.parentNode?.insertBefore(codeBlockContainer, codeBlock);
    codeBlockContainer.appendChild(codeBlock);

    const floatingButton = document.createElement("div");
    floatingButton.className = "tsw-floating-button";
    floatingButton.innerHTML = LOGO_SVG;
    codeBlockContainer.appendChild(floatingButton);

    const handleButtonClick = () => {
      const containerDiv = document.createElement("div");
      containerDiv.className = "tsw-code-container";
      codeBlockContainer.insertBefore(containerDiv, codeBlock);
      containerDiv.appendChild(codeBlock);

      const root = createRoot(containerDiv);
      root.render(reactComponent);

      floatingButton?.remove();
      codeBlockContainer.removeEventListener("mouseenter", showFloatingButton);
      codeBlockContainer.removeEventListener("mouseleave", hideFloatingButton);
    };

    floatingButton.addEventListener("click", handleButtonClick);

    const showFloatingButton = () => {
      if (floatingButton) {
        floatingButton.style.opacity = "1";
      }
    };

    const hideFloatingButton = () => {
      if (floatingButton) {
        floatingButton.style.opacity = "0";
      }
    };

    codeBlockContainer.addEventListener("mouseenter", showFloatingButton);
    codeBlockContainer.addEventListener("mouseleave", hideFloatingButton);
  };

  const processCodeBlock = (codeBlock: Element) => {
    if (
      !codeBlock ||
      codeBlock.parentElement?.classList.contains("tsw-code-wrapper") ||
      codeBlock.parentElement?.querySelector(".tsw-floating-button")
    ) {
      console.log("Code block already processed");
      return;
    }

    const codeText = codeBlock.textContent;
    if (!codeText) {
      return;
    }

    const longEnough =
      codeText.split("\n").length >= 5 || codeBlock.querySelectorAll("div, span").length >= 5;

    if (longEnough) {
      createFloatingButton(
        codeBlock,
        React.createElement(CodeWrapper, {
          rawCode: codeText,
          codeBlock: window.location.hostname.includes("github.com")
            ? codeBlock.outerHTML
            : codeBlock.innerHTML,
        })
      );
    }
  };

  const processImgElm = (imgElm: Element) => {
    if (
      !imgElm ||
      imgElm.parentElement?.classList.contains("tsw-code-wrapper") ||
      imgElm.parentElement?.querySelector(".tsw-floating-button")
    ) {
      console.log("Img already processed");
      return;
    }

    createFloatingButton(
      imgElm,
      React.createElement(ImgWrapper, {
        imgSrc: imgElm.getAttribute("src")!,
        imgBlock: imgElm.outerHTML,
      })
    );
  };

  const processAllFoundTags = () => {
    const codeBlocks = findAllCodeBlocks();
    const images = findAllImages();

    if (codeBlocks.length + images.length === 0) {
      return;
    }

    addStyles();

    for (let i = 0; i < codeBlocks.length; i++) {
      processCodeBlock(codeBlocks[i]);
    }

    for (let i = 0; i < images.length; i++) {
      processImgElm(images[i]);
    }
  };

  processAllFoundTags();

  const observer = new MutationObserver(
    debounce(() => {
      processAllFoundTags();
    }, 1000)
  );

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    observer.disconnect();
  }, 5000);
};

const summarize = async () => {
  const panel = document.getElementById("tsw-toggle-panel");
  if (!panel) {
    return;
  }
  panel.style.display = "block";
  panel.innerHTML = `
    <div  class="tsw-panel"">
      <div id="tsw-summary-content">
        <div style="text-align: center; padding: 20px;">
          <div class="loading-spinner"></div>
          <p>Summarizing...</p>
        </div>
      </div>
    </div>
  `;

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

const explainSelected = async (text: string) => {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";
  const panel = document.getElementById("tsw-toggle-panel");
  if (!panel) {
    return;
  }
  panel.style.display = "block";

  panel.innerHTML = `
    <div class="tsw-panel">
      <p class="tsw-panel-title">${title}：${text}</p>
      <hr>
      <div id="tsw-explanation-content">
        <div style="text-align: center; padding: 20px;">
          <div class="loading-spinner"></div>
          <p>Explaining...</p>
        </div>
      </div>
    </div>
  `;

  const explanation = isWord ? await explainWord(text) : await explainSentence(text);

  const explanationElement = document.getElementById("tsw-explanation-content");
  if (explanationElement) {
    explanationElement.innerHTML = explanation;
  }
};

chrome.runtime.onMessage.addListener((request) => {
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
    case "wrapTargetTags":
      wrapTargetTags();
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
