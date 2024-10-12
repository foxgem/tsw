import React from "react";
import { createRoot, Root } from "react-dom/client";
import { createWarningPopup } from "./WarningPopup";
import CircularButtonsContainer from "./components/CircularButtonsContainer";
import SelectionOverlay, { FloatingButton } from "./components/SelectionOverlay";
import { codeHandler, explainSelected, ocrHandler, summarize } from "./handlers";

type PickingChecker = (element: HTMLElement) => boolean;

function registerElmPicker(checkers: PickingChecker[]) {
  let prevElementMouseIsOver: Element | null = null;

  document.addEventListener("mousemove", function (e) {
    const elementMouseIsOver = document.elementFromPoint(e.clientX, e.clientY);
    if (!(elementMouseIsOver instanceof HTMLElement)) {
      return;
    }

    if (elementMouseIsOver === prevElementMouseIsOver) {
      return;
    }

    prevElementMouseIsOver = elementMouseIsOver;

    if (
      checkers.every((check) => {
        return !check(elementMouseIsOver);
      })
    ) {
      return;
    }

    const createUnmount = (targetElm: HTMLElement) => {
      const unmount = (e: Event) => {
        if (e instanceof MouseEvent) {
          const rect = targetElm.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            return;
          }
        }

        if (selectionReactRoot) {
          selectionReactRoot.unmount();
          const overlay = document.getElementById("tsw-selection-overlay");
          if (overlay) {
            selectionReactRoot = createRoot(overlay);
          }
        }
        e.target?.removeEventListener("mouseleave", unmount);
      };
      return unmount;
    };

    if (elementMouseIsOver instanceof HTMLImageElement) {
      const imageBlockButtons = [
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
          onClick: () => {
            ocrHandler("tsw-toggle-panel", elementMouseIsOver.src);
          },
          tooltip: "OCR",
        },
      ];

      createSelectionOverlay("tsw-selection-overlay", elementMouseIsOver, imageBlockButtons);
      elementMouseIsOver.addEventListener("mouseleave", createUnmount(elementMouseIsOver));
    } else {
      const codeBlockButtons = [
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
          onClick: () => {
            if (elementMouseIsOver.textContent) {
              codeHandler("tsw-toggle-panel", elementMouseIsOver.textContent);
            }
          },
          tooltip: "Explain",
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand rotate"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>`,
          onClick: () => {
            // rewriteHandler("tsw-toggle-panel", elementMouseIsOver.textContent, selectedLanguage)
          },
          tooltip: "Rewrite",
        },
      ];

      const targetElm = ((hostname: string) => {
        if (hostname === "github.com") {
          return elementMouseIsOver;
        } else if (hostname === "gist.github.com") {
          return elementMouseIsOver.closest("table");
        } else if (hostname === "medium.com") {
          return elementMouseIsOver.closest("pre") || elementMouseIsOver.parentElement;
        }
        return elementMouseIsOver.parentElement || elementMouseIsOver;
      })(window.location.hostname);

      if (!targetElm) {
        return;
      }

      createSelectionOverlay("tsw-selection-overlay", targetElm, codeBlockButtons);
      targetElm.addEventListener("mouseleave", createUnmount(targetElm));
    }
  });
}

let selectionReactRoot: Root;

function createSelectionOverlay(id: string, targetElm: HTMLElement, buttons: FloatingButton[]) {
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = id;
    document.body.appendChild(overlay);
    selectionReactRoot = createRoot(overlay);
  }

  selectionReactRoot.render(
    React.createElement(SelectionOverlay, {
      targetElm,
      buttons,
    })
  );
}

registerElmPicker([
  (e) => {
    if (!(e instanceof HTMLImageElement)) {
      return false;
    }

    const src = e.getAttribute("src");
    const classes = e.className.split(" ");
    return !!(
      src &&
      src.trim() !== "" &&
      !classes.some((cls) => cls.startsWith("avatar") || cls.startsWith("icon")) &&
      e.width >= 200 &&
      e.height >= 200
    );
  },
  (e) => {
    if (window.location.hostname === "github.com" && e.id === "read-only-cursor-text-area") {
      const codeText = e.textContent;
      return !!(codeText && codeText.split(/\n/).length >= 5);
    }

    if (window.location.hostname === "gist.github.com" && e.closest("table.highlight")) {
      return true;
    }

    if (window.location.hostname === "medium.com") {
      const codeText = e.closest("pre")?.querySelector("span")?.innerHTML;
      return !!(codeText && codeText.split(/<br>/).length >= 5);
    }

    if (e.tagName.toLowerCase() !== "pre") {
      return false;
    }

    const codeText = e.querySelector("code")?.textContent;
    return !!(codeText && codeText.split(/\n/).length >= 5);
  },
]);

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
        summarize("tsw-toggle-panel");
      },
    },
    {
      name: "Wand",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand rotate"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>`,
      action: () => {
        summarize("tsw-toggle-panel");
      },
    },
    {
      name: "Chat",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-messages-square"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>`,
      action: () => {
        summarize("tsw-toggle-panel");
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

  document.body.appendChild(panel);
}

createFloatingToggleButton();

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

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "explainSelected":
      if (request.text) {
        explainSelected("tsw-toggle-panel", request.text);
      }
      break;
    case "summarize":
      summarize("tsw-toggle-panel");
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
