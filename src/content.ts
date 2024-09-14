import { createWarningPopup } from "./WarningPopup";
import { explainSentence, explainWord } from "./ai";

const createSplitView = (
  leftContent: string,
  rightContent: string,
  leftWidth = 60,
  rightWidth = 40
) => {
  const originalContent = document.body.innerHTML;

  const leftPart = createPart("left", leftWidth);
  leftPart.innerHTML = leftContent;

  const rightPart = createPart("right", rightWidth);
  rightPart.innerHTML = rightContent;

  document.body.innerHTML = "";
  document.body.appendChild(leftPart);
  document.body.appendChild(rightPart);

  return () => {
    document.body.removeChild(leftPart);
    document.body.removeChild(rightPart);
    document.body.innerHTML = originalContent;
  };
};

const summarize = () => {
  const resetView = createSplitView(
    document.body.innerHTML,
    `
      <div style="padding: 20px; height: 100%; overflow-y: auto;">
        <button id="tsw-close-summary" style="position: fixed; top: 10px; right: 10px;">Close</button>
        <div>The summary</div>
      </div>
    `
  );

  document.getElementById("tsw-close-summary")?.addEventListener("click", resetView);
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
  const explanation =
    text.split(" ").length === 1 ? await explainWord(text) : await explainSentence(text);

  const resetView = createSplitView(
    document.body.innerHTML,
    `
    <div style="padding: 20px; height: 100%; overflow-y: auto;">
      <p>语法解析：${text}</p>
      <hr>
      ${explanation}
      <button id="tsw-close-explanation" style="position: fixed; top: 10px; right: 10px;">Close</button>
    </div>
  `
  );

  document.getElementById("tsw-close-explanation")?.addEventListener("click", resetView);
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
