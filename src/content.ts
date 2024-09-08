import { createWarningPopup } from "./WarningPopup";

let warningTimeout: number | undefined;
let closeTimeout: number | undefined;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const remainingTime = request.remainingTime;

    // Clear existing timeouts if any
    if (warningTimeout) window.clearTimeout(warningTimeout);
    if (closeTimeout) window.clearTimeout(closeTimeout);

    // Set timeout for showing warning
    if (remainingTime > 10) {
      warningTimeout = window.setTimeout(() => {
        showWarning();
      }, (remainingTime - 10) * 1000) as unknown as number;
    } else {
      // If less than 10 seconds left, show warning immediately
      showWarning();
    }

    // Set timeout for closing the page
    closeTimeout = window.setTimeout(() => {
      chrome.runtime.sendMessage({ action: "closePage" });
    }, remainingTime * 1000) as unknown as number;
  } else if (request.action === "showWarning") {
    showWarning();
  }
});

function showWarning() {
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
        if (popupContainer && popupContainer.parentNode) {
          popupContainer.parentNode.removeChild(popupContainer);
        }
      }, 300); // Wait for the transition to complete
    }
  };

  const warningElement = createWarningPopup(handleDismiss);
  popupContainer.appendChild(warningElement);
}
