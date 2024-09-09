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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closePage" && request.domain) {
    chrome.tabs.query({ url: `*://${request.domain}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.remove(tab.id);
          chrome.storage.local.remove(`timer_started_${tab.id}`);
        }
      });
    });
  }
});
