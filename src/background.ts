chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const domain = new URL(tab.url).hostname;
    chrome.storage.local.get(domain, (result) => {
      if (result[domain]) {
        const remainingTime = result[domain];
        chrome.tabs.sendMessage(tabId, { action: "startTimer", remainingTime, domain });

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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && tabs[0]?.url) {
        const tabDomain = new URL(tabs[0].url).hostname;
        if (tabDomain === request.domain) {
          chrome.tabs.remove(tabs[0].id);
        }
      }
    });
  }
});
