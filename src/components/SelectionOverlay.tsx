import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import TSWIcon from "./TSWIcon";

export interface FloatingButton {
  icon: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  tooltip?: string;
}

interface SelectionOverlayProps {
  targetElm: HTMLElement;
  buttons: FloatingButton[];
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  targetElm,
  buttons,
}) => {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null,
  );

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
        boxShadow: "rgba(200, 200, 200, 0.5) 0px 0px 5px",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          pointerEvents: "auto",
          ...(buttons.length > 1 && {
            borderRadius: "9999px",
            backgroundColor: "rgb(0, 123, 255)",
            width: "40px",
            padding: "15px 0px",
          }),
        }}
      >
        {buttons.map((button, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                style={{
                  width: "4px",
                  backgroundColor: "rgb(229, 231, 235)",
                }}
              />
            )}
            <button
              onClick={button.onClick}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                ...(buttons.length === 1 && {
                  borderRadius: "50%",
                  width: "30px",
                }),
                ...(buttons.length > 1 && {
                  padding: "4px",
                  fontWeight: "700",
                  margin: "0 auto",
                  marginBottom: index < buttons.length - 1 ? "8px" : "0",
                }),
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
          </React.Fragment>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default SelectionOverlay;
