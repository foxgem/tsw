import { debounce } from "lodash";
import React from "react";
import { createRoot } from "react-dom/client";
import { createWarningPopup } from "./WarningPopup";
import CodeWrapper from "./components/CodeWrapper";
import { explainSentence, explainWord, summariseLink } from "./utils/ai";
import { LOGO_SVG } from "./utils/constants";
import ImgWrapper from "./components/ImgWrapper";
import CircularButtonsContainer from "./components/CircularButtonsContainer";

function registerElmPicker(targetElms: string[]) {
  document.addEventListener("mousemove", function (e) {
    const elementMouseIsOver = document.elementFromPoint(e.clientX, e.clientY);
    document.querySelectorAll(".shadow").forEach((el) => {
      el.classList.remove("shadow");
    });

    if (
      elementMouseIsOver &&
      targetElms.some((e) => {
        return elementMouseIsOver.tagName.toLowerCase() === e.toLowerCase();
      })
    ) {
      elementMouseIsOver.classList.add("shadow");
    }
  });
}

registerElmPicker(["img", "code", "pre"]);

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
  const containerDiv = document.createElement("div");
  containerDiv.id = "tsw-buttons-container";
  document.body.appendChild(containerDiv);

  const panel = document.createElement("div");
  panel.id = "tsw-toggle-panel";
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    right: 50px;
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
  document.body.appendChild(panel);

  const iconArray = [
    {
      name: "Summary",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
      action: () => {
        summarize();
        // buttonsContainer.style.display = "none";
      },
    },
    {
      name: "Wand",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand rotate"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>`,
      action: () => {
        summarize();
        // buttonsContainer.style.display = "none";
      },
    },
    {
      name: "Chat",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-messages-square"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>`,
      action: () => {
        summarize();
        // buttonsContainer.style.display = "none";
      },
    },
  ];

  const root = createRoot(containerDiv);
  root.render(
    React.createElement(CircularButtonsContainer, {
      id: "tsw-buttons-container",
      iconBtns: iconArray,
    })
  );

  // floatingButton.addEventListener("click", () => {
  //   buttonsContainer.style.display = buttonsContainer.style.display === "none" ? "flex" : "none";
  // });

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
  const createFloatingButton = (codeBlock: Element, reactComponent: React.ReactElement,  blockWidth?:number, blockHeight?:number) => {
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

      if (blockHeight && blockWidth) {
        setTimeout(() => setTabContentHeight(containerDiv, blockWidth, blockHeight), 0);
      }
    };

    const setTabContentHeight = (container: HTMLElement, width: number, height: number) => {
      const tabContents = container.querySelectorAll('.tsw-tab-content') as NodeListOf<HTMLElement>;
      tabContents.forEach(tabContent => {
        tabContent.style.height = `${height}px`;
        tabContent.style.width = `${width}px`;
      });
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
    const imgElement = imgElm as HTMLImageElement;
    const imgHeight = imgElement.height;
    const imgWidth = imgElement.width;
    
    console.log("Image size", { widht: imgWidth, height: imgHeight });

    createFloatingButton(
      imgElm,
      React.createElement(ImgWrapper, {
        imgSrc: imgElm.getAttribute("src")!,
        imgBlock: imgElm.outerHTML,
      }),
      imgWidth,
      imgHeight
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
      <button id="tsw-close-right-part">Close</button>
      <div id="tsw-summary-content">
        <div style="text-align: center; padding: 20px;">
          <div class="loading-spinner"></div>
          <p>Summarizing...</p>
        </div>
      </div>
    </div>
  `;

  const closeButton = document.querySelector("#tsw-close-right-part");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      panel.style.display = "none";
    });
  }

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
      <button id="tsw-close-right-part">Close</button>
    </div>
  `;

  const closeButton = document.querySelector("#tsw-close-right-part");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      panel.style.display = "none";
    });
  }

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
