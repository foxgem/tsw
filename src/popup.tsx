import React, { useState, useEffect } from "react";
import SiteManager from "./components/SiteManager";

function IndexPopup() {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMenuItem === "Summary") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.id) {
          chrome.tabs.sendMessage(currentTab.id, { action: "summarize" });
        } else {
          console.error("Unable to access current tab");
        }
      });
    }
  }, [selectedMenuItem]);

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "Summary":
        return null;
      case "Timers for Sites":
        return (
          <div style={{ width: "300px", padding: "20px" }}>
            <h1>Time Spend Watcher</h1>
            <SiteManager />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          borderRight: "1px solid #ccc",
          backgroundColor: "#f0f0f0",
          minWidth: "150px",
        }}
      >
        <button
          onClick={() => setSelectedMenuItem("Summary")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: selectedMenuItem === "Summary" ? "#007bff" : "#e0e0e0",
            color: selectedMenuItem === "Summary" ? "white" : "black",
            cursor: "pointer",
            marginBottom: "10px",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4da6ff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              selectedMenuItem === "Summary" ? "#007bff" : "#e0e0e0")
          }
        >
          Summary
        </button>
        <button
          onClick={() => setSelectedMenuItem("Timers for Sites")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: selectedMenuItem === "Timers for Sites" ? "#007bff" : "#e0e0e0",
            color: selectedMenuItem === "Timers for Sites" ? "white" : "black",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4da6ff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              selectedMenuItem === "Timers for Sites" ? "#007bff" : "#e0e0e0")
          }
        >
          Timers for Sites
        </button>
      </nav>
      {selectedMenuItem === "Timers for Sites" && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            borderLeft: "none",
            flexGrow: 1,
          }}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
}

export default IndexPopup;
