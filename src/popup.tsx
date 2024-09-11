import React, { useState } from "react";
import SiteManager from "./components/SiteManager";

function IndexPopup() {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "Summary":
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentTab = tabs[0];
          if (currentTab && currentTab.id) {
            chrome.tabs.sendMessage(currentTab.id, { action: "splitTab" });
          } else {
            console.error("Unable to access current tab");
          }
        });
        return null;
      case "Timers for Sites":
        return (
          <div style={{ width: "300px", padding: "10px" }}>
            <h1>Time Spend Watcher</h1>
            <SiteManager />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <button onClick={() => setSelectedMenuItem("Summary")}>Summary</button>
        <button onClick={() => setSelectedMenuItem("Timers for Sites")}>Timers for Sites</button>
      </div>
      {renderContent()}
    </div>
  );
}

export default IndexPopup;
