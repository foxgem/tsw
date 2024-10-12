import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import TSWIcon from "./TSWIcon";

export interface FloatingButton {
  icon: string;
  onClick: () => void;
  tooltip?: string;
}

interface SelectionOverlayProps {
  targetElm: HTMLElement;
  buttons: FloatingButton[];
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ targetElm, buttons }) => {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const updatePosition = useCallback(() => {
    if (selectedElement) {
      const rect = selectedElement.getBoundingClientRect();
      const overlay = document.getElementById("selection-overlay");
      if (overlay) {
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
      }
    }
  }, [selectedElement]);

  useEffect(() => {
    setSelectedElement(targetElm);
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetElm, updatePosition]);

  if (!selectedElement) return null;

  return ReactDOM.createPortal(
    <div
      id="selection-overlay"
      style={{
        position: "absolute",
        border: "2px solid #007bff",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          display: "flex",
          gap: "5px",
          pointerEvents: "auto",
        }}
      >
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title={button.tooltip}
          >
            <TSWIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                fill="currentColor"
                dangerouslySetInnerHTML={{ __html: button.icon }}
              />
            </TSWIcon>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default SelectionOverlay;
