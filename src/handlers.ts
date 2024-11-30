import React from "react";
import { createRoot } from "react-dom/client";
import { ChatUI } from "~components/ChatUI";
import { Loading } from "~components/Loading";
import type { Command } from "~lib/types";
import { TSWPanel } from "./components/TSWPanel";
import { iconArray } from "./content";
import {
  explainCode,
  explainSentence,
  explainWord,
  ocr,
  rewriteCode,
  summariseLink,
} from "./utils/ai";

function withOutputPanel(
  outputElm: string,
  title: string,
  handler: () => void,
  children: React.ReactNode,
) {
  const { wrapper, innerWrapper, header } = setupWrapperAndBody();

  let panel = document.getElementById(outputElm);

  if (!panel) {
    panel = document.createElement("div");
    panel.id = outputElm;
    panel.style.cssText = `
    color-scheme: light;
    width: 38vw;
    height: 97vh;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    position: fixed;
    right: 10px;
    top: 0px; 
    margin-top: 10px;
    border-radius: 10px;
    z-index:10000;
    display:none;
  `;
  }

  document.body.appendChild(panel);

  panel.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.1)";
  panel.style.display = "block";
  panel.innerHTML = "";
  const root = createRoot(panel);
  root.render(
    React.createElement(TSWPanel, {
      title: title,
      children,
      onRender: () => {
        const closeButton = document.querySelector("#tsw-close-right-part");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            resetWrapperCss(wrapper, innerWrapper, header, panel);
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
                resetWrapperCss(wrapper, innerWrapper, header, panel);
              }
            });
          }
        }

        handler();
      },
    }),
  );
}

function setupWrapperAndBody(): {
  wrapper: HTMLElement;
  innerWrapper: HTMLElement;
  header: HTMLElement;
} {
  let wrapper = document.getElementById("tsw-outer-wrapper");
  const innerWrapper = document.createElement("div");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "tsw-outer-wrapper";
    wrapper.style.cssText = `
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        transition: all 0.3s ease;
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        overflow: scroll;
        margin-right:10px;
      `;

    innerWrapper.id = "tsw-inner-wrapper";

    const bodyClasses = document.body.className;
    const bodyAttributes = Array.from(document.body.attributes);

    const newBody = document.createElement("body");
    newBody.className = bodyClasses;
    for (const attr of bodyAttributes) {
      newBody.setAttribute(attr.name, attr.value);
    }

    while (document.body.firstChild) {
      newBody.appendChild(document.body.firstChild);
    }

    innerWrapper.appendChild(newBody);
    wrapper.appendChild(innerWrapper);
    document.body.appendChild(wrapper);
  }

  const newWidth = "60vw";
  wrapper.style.width = newWidth;
  innerWrapper.style.cssText = `
          width: 80vw;
          height: 100vh;
      `;
  const header = document.querySelector("header");
  if (header && header instanceof HTMLElement) {
    const headerStyle = window.getComputedStyle(header);
    if (headerStyle.position === "fixed") {
      header.style.width = "60vw";
    }
  }

  window.dispatchEvent(new Event("resize"));

  return { wrapper, innerWrapper, header };
}

function resetWrapperCss(
  wrapper: HTMLElement,
  innerWrapper: HTMLElement,
  header: HTMLElement,
  panel: HTMLElement,
) {
  panel.style.display = "none";
  wrapper.style.width = "100vw";
  innerWrapper.style.cssText = `
                            width: 100vw;
                            overflow:scroll;
                            box-shadow: none;
                        `;
  if (header.style.position === "fixed" && header.style.width === "60vw") {
    header.style.width = "100vw";
  }
}

export async function summarize(outputElm: string) {
  withOutputPanel(
    outputElm,
    "Summary",
    async () => {
      const summaryElement = document.getElementById("tsw-output-body");
      if (summaryElement) {
        await summariseLink(document.body.innerHTML, summaryElement);
      }
    },
    React.createElement(Loading, {
      message: "Summarizing",
    }),
  );
}

export async function explainSelected(outputElm: string, text: string) {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";

  withOutputPanel(
    outputElm,
    `${title}`,
    async () => {
      const explanationElement = document.getElementById("tsw-output-body");
      if (explanationElement) {
        isWord
          ? await explainWord(text, explanationElement)
          : await explainSentence(text, explanationElement);
      }
    },
    React.createElement(Loading, {
      message: "Explaining",
    }),
  );
}

export async function ocrHandler(
  outputElm: string,
  imgSrc: string,
  postPrompt = "",
) {
  withOutputPanel(
    outputElm,
    "Text in Image",
    async () => {
      const imgContentElement = document.getElementById("tsw-output-body");
      if (imgContentElement) {
        try {
          await ocr(imgSrc, imgContentElement, postPrompt);
        } catch (e) {
          imgContentElement.innerHTML = e as string;
        }
      }
    },
    React.createElement(Loading, {
      message: "Processing",
    }),
  );
}

export function codeHandler(outputElm: string, code: string) {
  withOutputPanel(
    outputElm,
    "Code Block Explanation",
    async () => {
      const codeContentElement = document.getElementById("tsw-output-body");
      if (codeContentElement) {
        await explainCode(code, codeContentElement);
      }
    },
    React.createElement(Loading, {
      message: "Explaining",
    }),
  );
}

export function rewriteHandler(
  outputElm: string,
  code: string,
  targetLanguage: string,
) {
  withOutputPanel(
    outputElm,
    `Rewrite Code with ${targetLanguage}`,
    async () => {
      const codeContentElement = document.getElementById("tsw-output-body");
      if (codeContentElement) {
        await rewriteCode(code, targetLanguage, codeContentElement);
      }
    },
    React.createElement(Loading, {
      message: "Rewriting",
    }),
  );
}

export function chattingHandler(outputElm: string) {
  withOutputPanel(
    outputElm,
    "Chatting With Page",
    async () => {},
    React.createElement(ChatUI, {
      pageText: document.body.innerHTML,
      pageURL: window.location.href,
    }),
  );
}

export async function callNanoWithSelected(
  command: Command,
  outputElm: string,
  textSelected: string,
) {
  //todo
  // withOutputPanel(outputElm, "Thinking", "Nano", async () => {
  //   const element = document.getElementById("tsw-output-body");
  //   if (textSelected) {
  //     //await callNanoModel(command, textSelected, element);
  //   }
  // });
}
