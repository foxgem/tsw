import { useEffect } from "react";
import { iconArray } from "~/content";
import panelStyles from "../css/panel.module.css";
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
    <div className={panelStyles.tswPanel}>
      <div className={panelStyles.tswPanelHeader}>
        <div className={panelStyles.tswPanelHeaderLogo}>
          <ActionIcon name="Logo" />
          <span>{title}</span>
        </div>
        <div className={panelStyles.tswPanelMenu}>
          <div className={panelStyles.tswPanelHeaderAction}>
            {iconArray.map((icon) => (
              <button
                type="button"
                className={panelStyles.tswActionBtn}
                id={`tsw-${icon.name.toLowerCase()}-btn`}
                key={icon.name}
              >
                <ActionIcon name={icon.name} />
              </button>
            ))}
          </div>
          <div className={panelStyles.tswPanelHeaderSeparator} />
          <button id="tsw-close-right-part" type="button">
            <ActionIcon name="Close" />
          </button>
        </div>
      </div>
      <div className={panelStyles.tswPanelContent}>
        <div id="tsw-output-body">
          <div className={panelStyles.tswLoadingContainer}>
            <div className={panelStyles.loadingSpinner} />
            <p>{placeHolder}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
