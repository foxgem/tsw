import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { ActionIcon } from "./ActionIcon";
import IconWrapper from "./IconWrapper";
import { MessageCircleMoreIcon } from "~/components/ui/icons/message-circle-more";
import { FilePenLineIcon } from "~/components/ui/icons/file-pen-line";
import { LanguagesIcon } from "~/components/ui/icons/languages";
import iconsStyles from "~/css/icons.module.css";

export interface FloatingButton {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  tooltip: string;
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
          <React.Fragment key={`button-${button.tooltip}-${index}`}>
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
              type="button"
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
              <IconWrapper>
                {button.tooltip === "Explain" ? (
                  <MessageCircleMoreIcon
                    size={24}
                    className={iconsStyles.dynamicIcon}
                  />
                ) : button.tooltip === "Rewrite" ? (
                  <FilePenLineIcon
                    size={24}
                    className={iconsStyles.dynamicIcon}
                  />
                ) : button.tooltip === "Translate" ? (
                  <LanguagesIcon
                    size={24}
                    className={iconsStyles.dynamicIcon}
                  />
                ) : (
                  <ActionIcon name={button.tooltip} />
                )}
              </IconWrapper>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default SelectionOverlay;
