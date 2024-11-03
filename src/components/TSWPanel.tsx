import logo from "data-base64:/assets/icon.png";
import { useEffect } from "react";
import { iconArray } from "~/content";
import { ActionIcon } from "./ActionIcon";

export interface PanelProps {
  title: string;
  placeHolder: string;
  onRender?: () => void;
}

export function TSWPanel({ title, placeHolder, onRender }: PanelProps) {
  useEffect(() => {
    if (onRender) {
      onRender();
    }
  }, [onRender]);

  return (
    <div className="tsw-panel">
      <div className="tsw-panel-header">
        <div className="tsw-panel-header-logo">
          <img src={logo} alt="TSW Icon" className="tsw-icon" />
          <span>{title}</span>
        </div>
        <div className="tsw-panel-menu">
          <div className="tsw-panel-header-action">
            {iconArray.map((icon) => (
              <button
                type="button"
                className="tsw-action-btn"
                id={`tsw-${icon.name.toLowerCase()}-btn`}
                key={icon.name}
              >
                <ActionIcon name={icon.name} />
              </button>
            ))}
          </div>
          <div className="tsw-panel-header-separator" />
          <button id="tsw-close-right-part" type="button">
            <ActionIcon name="Close" />
          </button>
        </div>
      </div>
      <div className="tsw-panel-content">
        <div id="tsw-output-body">
          <div className="tsw-loading-container">
            <div className="loading-spinner" />
            <p>{placeHolder}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
