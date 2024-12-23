import React from "react";
import { type Root, createRoot } from "react-dom/client";
import TextSelectionMenu from "~components/TextSelectMenu";
import { type QuickPrompt, initDb } from "~utils/storage";
import { createWarningPopup } from "./WarningPopup";
import SelectLang from "./components/SelectLang";
import SelectionOverlay, {
  type FloatingButton,
} from "./components/SelectionOverlay";
import {
  callQuickPromptWithSelected,
  chattingHandler,
  codeHandler,
  explainSelected,
  ocrHandler,
  rewriteHandler,
  summarize,
  thinkingHandler,
} from "./handlers";
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

    const togglePanel = document.getElementById("tsw-toggle-panel");
    if (togglePanel?.contains(elementMouseIsOver)) {
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
              z-index: 999;
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
      chattingHandler("tsw-toggle-panel");
    },
  },
  {
    name: "Thinking",
    action: () => {
      thinkingHandler("tsw-toggle-panel");
    },
  },
];

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

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "openChat":
      chattingHandler("tsw-toggle-panel");
      break;
  }
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
  // cmd + @
  if (e.metaKey && e.shiftKey && e.key === "2") {
    e.preventDefault();
    chattingHandler("tsw-toggle-panel");
  }
});

function createSelectMenu() {
  const container = document.createElement("div");
  container.id = "tsw-select-root";
  document.body.appendChild(container);
  const root = createRoot(container);

  const onSelect = async (command: QuickPrompt) => {
    const selectedText = window.getSelection()?.toString().trim();
    await callQuickPromptWithSelected(
      command,
      "tsw-toggle-panel",
      selectedText,
    );
    window.getSelection()?.removeAllRanges();
  };

  const onTranslate = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    await explainSelected("tsw-toggle-panel", selectedText);
    window.getSelection()?.removeAllRanges();
  };

  let hasSelection = false;

  document.addEventListener("selectionchange", () => {
    const newSelection = window.getSelection();
    hasSelection = !!(newSelection && newSelection.toString().trim() !== "");
    if (!hasSelection) {
      container.style.display = "none";
    }
  });

  document.addEventListener("mouseup", () => {
    if (!hasSelection) return;
    const selection = window.getSelection();

    const togglePanel = document.getElementById("tsw-toggle-panel");
    const selectionNode = selection?.anchorNode?.parentElement;
    if (togglePanel?.contains(selectionNode)) {
      return;
    }

    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0);

      let rect = range.getBoundingClientRect();
      let position = {
        x: 0,
        y: 0,
      };
      if (rect.x === 0 && rect.y === 0) {
        const selectedNode = range.startContainer.parentElement;
        if (selectedNode) {
          rect = selectedNode.getBoundingClientRect();
          if (rect.x === 0) {
            const mouseEvent = window.event as MouseEvent;
            position = {
              x: mouseEvent?.clientX || 0,
              y: Math.max(rect.bottom + window.scrollY, 0),
            };
          } else {
            position = {
              x: rect.left + 100,
              y: Math.max(rect.bottom + window.scrollY, 0),
            };
          }
        }
      } else {
        position = {
          x: Math.min(
            rect.left + window.scrollX + rect.width / 2,
            window.innerWidth - 100,
          ),
          y: Math.max(rect.bottom + window.scrollY, 0),
        };
      }

      if (position.x === 0 && position.y === 0) {
        const mouseEvent = window.event as MouseEvent;
        position.x = mouseEvent?.clientX || rect.left;
        position.y = mouseEvent?.clientY || rect.bottom;
      }

      root.render(
        React.createElement(TextSelectionMenu, {
          selectedText: selection.toString().trim(),
          position,
          onSelect,
          onTranslate,
        }),
      );
      container.style.display = "block";
    }
  });
}

createSelectMenu();
initDb();
