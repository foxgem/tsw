import { readTimerForDomain, timerStartedMap } from "./utils/db";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainSelected",
    title: "Explain Selected Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainSelected" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "explainSelected", text: info.selectionText });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;

  if (changeInfo.status === "loading" && timerStartedMap.has(tabId) && tab.url !== changeInfo.url) {
    timerStartedMap.delete(tabId);
    chrome.tabs
      .sendMessage(tabId, { action: "stopTimer" })
      .catch((err) => console.log("Could not send stopTimer message:", err.message));
  }

  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "wrapCodeBlocks" });
  }

  if (changeInfo.status === "complete" && !timerStartedMap.has(tabId)) {
    const domain = new URL(tab.url).hostname;
    const timer = await readTimerForDomain(domain);
    if (!timer) return;

    const remainingTime = timer.time;
    chrome.tabs.sendMessage(tabId, { action: "startTimer", remainingTime, domain });
    timerStartedMap.set(tabId, true);

    if (remainingTime > 10) {
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: "showWarning" });
      }, (remainingTime - 10) * 1000);
    } else {
      chrome.tabs.sendMessage(tabId, { action: "showWarning" });
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  timerStartedMap.delete(tabId);
  chrome.tabs
    .sendMessage(tabId, { action: "stopTimer" })
    .catch((err) => console.log("Could not send stopTimer message:", err.message));
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closePage" && request.domain) {
    chrome.tabs.query({ url: `*://${request.domain}/*` }, (tabs) => {
      tabs.forEach((tab) => tab.id && chrome.tabs.remove(tab.id));
    });
  }
});
