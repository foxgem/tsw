import React from "react";
import { type Root, createRoot } from "react-dom/client";
import { createWarningPopup } from "./WarningPopup";
import CircularButtonsContainer from "./components/CircularButtonsContainer";
import SelectionOverlay, {
  type FloatingButton,
} from "./components/SelectionOverlay";
import {
  codeHandler,
  explainSelected,
  ocrHandler,
  rewriteHandler,
  summarize,
} from "./handlers";
import "@/css/wrapper.css";
import SelectLang from "./components/SelectLang";
type PickingChecker = (element: HTMLElement) => boolean;
declare global {
  interface Window {
    picking: boolean;
  }
}
window.picking = false;

function registerElmPicker(checkers: PickingChecker[]) {
  let prevElementMouseIsOver: Element | null = null;

  document.addEventListener("mousemove", (e) => {
    if (!window.picking) {
      return;
    }

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
          onClick: () => {
            ocrHandler("tsw-toggle-panel", elementMouseIsOver.src);
            elementMouseIsOver.dispatchEvent(new Event("mouseleave"));
          },
          tooltip: "OCR",
        },
        {
          onClick: () => {
            ocrHandler(
              "tsw-toggle-panel",
              elementMouseIsOver.src,
              "Translate the text into Chinese",
            );
            elementMouseIsOver.dispatchEvent(new Event("mouseleave"));
          },
          tooltip: "Translate",
        },
      ];

      createSelectionOverlay(
        "tsw-selection-overlay",
        elementMouseIsOver,
        imageBlockButtons,
      );
      elementMouseIsOver.addEventListener(
        "mouseleave",
        createUnmount(elementMouseIsOver),
      );
    } else {
      const targetElm = ((hostname: string) => {
        if (hostname === "github.com") {
          return elementMouseIsOver;
        }
        if (hostname === "gist.github.com") {
          return elementMouseIsOver.closest("table");
        }
        if (hostname === "medium.com") {
          return (
            elementMouseIsOver.closest("pre") ||
            elementMouseIsOver.parentElement
          );
        }
        if (hostname === "sdk.vercel.ai") {
          return elementMouseIsOver.closest("pre");
        }
        return elementMouseIsOver.parentElement || elementMouseIsOver;
      })(window.location.hostname);

      if (!targetElm) {
        return;
      }

      const codeBlockButtons = [
        {
          onClick: () => {
            if (elementMouseIsOver.textContent) {
              codeHandler("tsw-toggle-panel", elementMouseIsOver.textContent);
            }
            targetElm.dispatchEvent(new Event("mouseleave"));
          },
          tooltip: "Explain",
        },
        {
          onClick: (event: React.MouseEvent<HTMLElement>) => {
            const buttonElement = event.currentTarget as HTMLElement;
            const rect = buttonElement.getBoundingClientRect();

            const overlay = document.getElementById("selection-overlay");
            if (!overlay) return;

            const selectLangElement = document.createElement("div");
            selectLangElement.id = "tsw-select-lang-container";
            overlay.appendChild(selectLangElement);

            selectLangElement.style.cssText = `
              position: absolute;
              margin-top:4px;
              top: ${rect.bottom - overlay.getBoundingClientRect().top + 20}px;
              right: 0px;
              background-color: white;
              padding: 10px;
              border-radius: 4px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              pointer-events: auto;
              z-index: 9999;
            `;

            selectLangElement.addEventListener("click", (e) => {
              e.stopPropagation();
            });

            const removeSelectLang = () => {
              selectLangElement.remove();
            };
            selectLangElement.addEventListener("mouseleave", removeSelectLang);

            const selectLangRoot = createRoot(selectLangElement);
            selectLangRoot.render(
              React.createElement(SelectLang, {
                onLanguageChange: (selectedLanguage) => {
                  if (elementMouseIsOver?.textContent) {
                    rewriteHandler(
                      "tsw-toggle-panel",
                      elementMouseIsOver.textContent,
                      selectedLanguage,
                    );
                  }
                  removeSelectLang();
                  targetElm.dispatchEvent(new Event("mouseleave"));
                },
              }),
            );
          },
          tooltip: "Rewrite",
        },
      ];

      createSelectionOverlay(
        "tsw-selection-overlay",
        targetElm,
        codeBlockButtons,
      );
      targetElm.addEventListener("mouseleave", createUnmount(targetElm));
    }
  });
}

let selectionReactRoot: Root;

function createSelectionOverlay(
  id: string,
  targetElm: HTMLElement,
  buttons: FloatingButton[],
) {
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
      buttons: buttons.map((button) => ({
        ...button,
        onClick: (event: React.MouseEvent<HTMLElement>) =>
          button.onClick(event),
      })),
    }),
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
      !classes.some(
        (cls) => cls.startsWith("avatar") || cls.startsWith("icon"),
      ) &&
      e.width >= 200 &&
      e.height >= 200
    );
  },
  (e) => {
    if (
      window.location.hostname === "github.com" &&
      e.id === "read-only-cursor-text-area"
    ) {
      const codeText = e.textContent;
      return !!(codeText && codeText.split(/\n/).length >= 5);
    }

    if (
      window.location.hostname === "gist.github.com" &&
      e.closest("table.highlight")
    ) {
      return true;
    }

    if (window.location.hostname === "medium.com") {
      const codeText = e.closest("pre")?.querySelector("span")?.innerHTML;
      return !!(codeText && codeText.split(/<br>/).length >= 5);
    }

    if (window.location.hostname === "medium.com") {
      const codeText = e.closest("pre")?.querySelector("span")?.innerHTML;
      return !!(codeText && codeText.split(/<br>/).length >= 5);
    }

    if (window.location.hostname === "sdk.vercel.ai") {
      const codeText = e.closest("pre")?.querySelector("code")?.innerHTML;
      return !!(codeText && codeText.split(/<div/).length >= 5);
    }

    if (
      e.tagName.toLowerCase() !== "pre" &&
      e.tagName.toLowerCase() !== "code"
    ) {
      return false;
    }

    const codeText =
      e.tagName.toLowerCase() === "code"
        ? e.textContent
        : e.querySelector("code")?.textContent;
    return !!(codeText && codeText.split(/\n/).length >= 5);
  },
]);

export const iconArray = [
  {
    name: "Summary",
    action: () => {
      summarize("tsw-toggle-panel");
    },
  },
  {
    name: "Wand",
    action: () => {
      window.picking = !window.picking;
    },
  },
  {
    name: "Chat",
    action: () => {
      window.picking = !window.picking;
    },
  },
];

function createFloatingToggleButton() {
  const containerDiv = document.createElement("div");
  containerDiv.id = "tsw-buttons-container";
  document.body.appendChild(containerDiv);

  const panel = document.createElement("div");
  panel.id = "tsw-toggle-panel";
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 40%;
    height: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    z-index: 3999999;
    display: none;
  `;
  document.body.appendChild(panel);

  const root = createRoot(containerDiv);
  root.render(
    React.createElement(CircularButtonsContainer, {
      id: "tsw-buttons-container",
      iconBtns: iconArray,
    }),
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
      (remainingTime - 10) * 1000,
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
    if (popupContainer?.firstChild) {
      (popupContainer.firstChild as HTMLElement).style.transform =
        "translateY(-100%)";
      setTimeout(() => {
        popupContainer?.parentNode?.removeChild(popupContainer);
      }, 300);
    }
  };

  const warningElement = createWarningPopup(handleDismiss);
  popupContainer.appendChild(warningElement);
};
