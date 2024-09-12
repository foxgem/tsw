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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const domain = new URL(tab.url).hostname;
    chrome.storage.local.get([domain, `timer_started_${tabId}`], (result) => {
      if (result[domain] && !result[`timer_started_${tabId}`]) {
        const remainingTime = result[domain];
        chrome.tabs.sendMessage(tabId, { action: "startTimer", remainingTime, domain });
        chrome.storage.local.set({ [`timer_started_${tabId}`]: true });

        // Set up a warning when 10 seconds are left
        if (remainingTime > 10) {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "showWarning" });
          }, (remainingTime - 10) * 1000);
        } else {
          // If less than 10 seconds left, show warning immediately
          chrome.tabs.sendMessage(tabId, { action: "showWarning" });
        }
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.storage.local.remove(`timer_started_${tabId}`);
  chrome.tabs.sendMessage(tabId, { action: "stopTimer" }, () => {
    if (chrome.runtime.lastError) {
      console.log("Could not send stopTimer message:", chrome.runtime.lastError.message);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closePage" && request.domain) {
    chrome.tabs.query({ url: `*://${request.domain}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  }
});
