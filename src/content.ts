import { createWarningPopup } from "./WarningPopup";
import { explain } from "./ai";

const summarize = (leftWidth = 80) => {
  const existingLeftPart = document.querySelector(
    'div[style*="position: fixed"][style*="left: 0"]'
  );
  const existingRightPart = document.querySelector(
    'div[style*="position: fixed"][style*="right: 0"]'
  );

  if (existingLeftPart && existingRightPart) {
    document.body.removeChild(existingLeftPart);
    document.body.removeChild(existingRightPart);
    document.body.innerHTML = (existingLeftPart as HTMLElement).innerHTML;
  } else {
    const originalContent = document.body.innerHTML;
    const rightWidth = 100 - leftWidth;

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
        ${side === "right" ? "background-color: white;" : ""}
      `;
      return part;
    };

    const leftPart = createPart("left", leftWidth);
    leftPart.innerHTML = originalContent;

    const rightPart = createPart("right", rightWidth);
    rightPart.textContent = "The summary";

    document.body.innerHTML = "";
    document.body.appendChild(leftPart);
    document.body.appendChild(rightPart);
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
    ${side === "right" ? "background-color: white;" : ""}
  `;
  return part;
};

const explainSelected = async (text: string) => {
  const originalContent = document.body.innerHTML;
  const leftWidth = 60;
  const rightWidth = 40;

  const explanation = await explain(text);

  const leftPart = createPart("left", leftWidth);
  leftPart.innerHTML = originalContent;

  const rightPart = createPart("right", rightWidth);
  rightPart.innerHTML = `
    <div style="padding: 20px; height: 100%; overflow-y: auto;">
      <p>语法解析：${text}</p>
      <hr>
      ${explanation}
      <button id="tsw-close-explanation" style="position: fixed; top: 10px; right: 10px;">Close</button>
    </div>
  `;

  document.body.innerHTML = "";
  document.body.appendChild(leftPart);
  document.body.appendChild(rightPart);

  document.getElementById("tsw-close-explanation")?.addEventListener("click", () => {
    document.body.innerHTML = originalContent;
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "explainSelected":
      if (request.text) {
        explainSelected(request.text);
      }
      break;
    case "summarize":
      summarize(request.leftWidth);
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
