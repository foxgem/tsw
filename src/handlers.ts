import {
  explainSentence,
  explainWord,
  ocr,
  summariseLink,
  explainCode,
  rewriteCode,
  pageRag,
} from "./utils/ai";

let pageText: string;

function withOutputPanel(outputElm: string, initInnerHtml: string, handler: () => void) {
  const panel = document.getElementById(outputElm);
  if (!panel) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = `
    <div  class="tsw-panel"">
      <button id="tsw-close-right-part">Close</button>
      ${initInnerHtml}
    </div>
  `;

  const closeButton = document.querySelector("#tsw-close-right-part");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      panel.style.display = "none";
    });
  }

  handler();
}

function extractTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() || "";
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;

    // List of tags to exclude
    const excludeTags = ["SCRIPT", "STYLE", "IFRAME", "NOSCRIPT", "SVG", "PATH"];

    if (excludeTags.includes(element.tagName)) {
      return "";
    }

    // Optional: Check for hidden elements
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return "";
    }

    let text = "";
    for (const childNode of element.childNodes) {
      text += `${extractTextFromNode(childNode)} `;
    }
    return text.trim();
  }

  return "";
}

// Ensure the function is used somewhere to avoid the "never used" warning
export { extractTextFromNode };

export async function summarize(outputElm: string) {
  withOutputPanel(
    outputElm,
    `
    <p class="tsw-panel-title">Summary</p>
    <hr>
    <div id="tsw-summary-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Summarizing...</p>
      </div>
    </div>
  `,
    async () => {
      const summaryContent = await summariseLink(window.location.href);
      const summaryElement = document.getElementById("tsw-summary-content");
      if (summaryElement) {
        summaryElement.innerHTML = summaryContent;
      }
    }
  );
}

export async function explainSelected(outputElm: string, text: string) {
  const isWord = text.split(" ").length === 1;
  const title = isWord ? "单词释义" : "语法解析";

  withOutputPanel(
    outputElm,
    `
    <p class="tsw-panel-title">${title}：${text}</p>
    <hr>
    <div id="tsw-explanation-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Explaining...</p>
      </div>
    </div>
    `,
    async () => {
      const explanation = isWord ? await explainWord(text) : await explainSentence(text);
      const explanationElement = document.getElementById("tsw-explanation-content");
      if (explanationElement) {
        explanationElement.innerHTML = explanation;
      }

      // if (!pageText) {
      //   pageText = extractTextFromNode(document.body);
      // }
      // console.log(
      //   "page based rag: ",
      //   await pageRag(
      //     "if I want to search similar topic articles with google, what keywords would you like to suggest?",
      //     pageText
      //   )
      // );
    }
  );
}

export async function ocrHandler(outputElm: string, imgSrc: string, postPrompt = "") {
  withOutputPanel(
    outputElm,
    `
    <p class="tsw-panel-title">Text in Image</p>
    <hr>
    <div id="tsw-image-content">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Processing...</p>
      </div>
    </div>
    `,
    async () => {
      const imgContentElement = document.getElementById("tsw-image-content");
      if (imgContentElement) {
        try {
          const response = await fetch(imgSrc);
          const buffer = await response.arrayBuffer();
          const mimeType = response.headers.get("Content-Type") || "image/jpeg";
          const result = await ocr(Buffer.from(buffer), mimeType, postPrompt);
          imgContentElement.innerHTML = result;
        } catch (e) {
          imgContentElement.innerHTML = e as string;
        }
      }
    }
  );
}

export function codeHandler(outputElm: string, code: string) {
  withOutputPanel(
    outputElm,
    `
    <p class="tsw-panel-title">Code Block Explanation</p>
    <hr>
    <div id="tsw-code-explanation">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Explaining...</p>
      </div>
    </div>
    `,
    async () => {
      const codeContentElement = document.getElementById("tsw-code-explanation");
      if (codeContentElement) {
        const result = await explainCode(code);
        codeContentElement.innerHTML = result;
      }
    }
  );
}

export function rewriteHandler(outputElm: string, code: string, targetLanguage: string) {
  withOutputPanel(
    outputElm,
    `
    <p class="tsw-panel-title">Rewrite Code with ${targetLanguage}</p>
    <hr>
    <div id="tsw-code-result">
      <div style="text-align: center; padding: 20px;">
        <div class="loading-spinner"></div>
        <p>Rewriting...</p>
      </div>
    </div>
    `,
    async () => {
      const codeContentElement = document.getElementById("tsw-code-result");
      if (codeContentElement) {
        const result = await rewriteCode(code, targetLanguage);
        codeContentElement.innerHTML = result;
      }
    }
  );
}
