import mermaidSvg from "data-base64:/assets/mermaid.svg";
import * as htmlToImage from "html-to-image";
import { fromUint8Array } from "js-base64";
import { deflate } from "pako";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import chatStyles from "~/css/chatui.module.css";
import commontyles from "~/css/common.module.css";
import iconsStyles from "~/css/icons.module.css";
import shadcnStyles from "~/css/shadcn.module.css";
import { cn } from "~lib/utils";
import { CopyToClipboard } from "./CopyToClipboard";
import { Loading } from "./Loading";
import { Button } from "./ui/button";
import { DownloadIcon } from "./ui/icons/download";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface MindmapProps {
  data: MindmapData;
  onGenerate?: (pakoValue: string | null) => void;
}

export interface MindmapData {
  title: string;
  description: string;
  diagram: string;
  error?: boolean;
  message?: string;
}

const spinKeyframes = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = spinKeyframes;
document.head.appendChild(styleSheet);

const styles = {
  container: {
    width: "95%",
    margin: "0 auto",
    perspective: "1000px",
  },

  cardWrapper: {
    height: "100%",
    transformStyle: "preserve-3d",
    borderRadius: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  content: {
    marginBottom: "20px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "70vh",
  },
  dialogContent: {
    position: "fixed",
    left: "50%",
    top: "50%",
    zIndex: 50,
    display: "grid",
    width: "100%",
    maxWidth: "1200px",
    transform: "translate(-50%, -50%)",
    gap: "0",
    border: "1px solid var(--border)",
    backgroundColor: "white",
    padding: "20px",
    boxShadow: " 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a",
    transitionDuration: "200ms",
    height: "650px",
    color: "black",
  },
  loader: {
    height: "32px",
    width: "32px",
    color: "rgb(107, 114, 128)",
    animation: "spin 1s linear infinite",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  errorMessage: {
    color: "rgb(239, 68, 68)",
  },
  imageContainer: {
    width: "100%",
    height: "595px",
    border: "none",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  diagram: {
    maxHeight: "500px",
    maxWidth: "1150px",
    margin: "0 auto",
  },
  errorContainer: {
    textAlign: "left",
    width: "100%",
    height: "500px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
  },
  tabsContent: {
    width: "100%",
    height: "100%",
  },
  tabsList: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid #e5e7eb",
    width: "100%",
    justifyContent: "start",
    marginTop: "6px",
  },

  tabsTrigger: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s",
    borderRadius: "0",
  },

  tabsTriggerHovered: {
    backgroundColor: "#F1F5F9",
    color: "#2563eb",
  },

  tabsTriggerActive: {
    backgroundColor: "#F1F5F9",
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
  },

  tabsTriggerHover: {
    backgroundColor: "#F1F5F9",
    color: "#2563eb",
  },
  codeBlock: {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    padding: "16px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "14px",
    overflowX: "auto",
    height: "500px",
  },
  codeContent: { color: "#ffffff" },
  debugLink: {
    color: "#63B3ED",
    textDecoration: "none",
    marginTop: "12px",
    display: "inline-block",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  mermaidSvg: { width: "16px", height: "16px" },
} as const;

const mermaidURL = "https://mermaid.ink/img";

const Mindmap: React.FC<MindmapProps> = ({ data, onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pakoValue, setPakoValue] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  if (data.error) {
    return (
      <div style={styles.container}>
        <div
          style={{
            ...styles.cardWrapper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgb(220, 38, 38)",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {data.message || "Fail to generate Knowledge Card."}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!pakoValue) {
      const loadPako = async () => {
        try {
          const json = JSON.stringify({ code: data.diagram });
          const encodeData = new TextEncoder().encode(json);
          const compressed = deflate(encodeData, { level: 9 });
          const base64 = fromUint8Array(compressed, true);
          onGenerate?.(base64);
          setPakoValue(base64);
          const response = await fetch(`${mermaidURL}/pako:${base64}?type=png`);

          if (!response.ok) {
            const textContent = await response.text();
            setErrorMessage(textContent);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);

          setImageSrc(imageUrl);
        } catch (error) {
          console.error("Error", error);
        }
      };

      loadPako();
    }
  }, [pakoValue, data.diagram, onGenerate]);

  useEffect(() => {
    const panel = document.getElementById("tsw-toggle-panel");
    const selectionOverlay = document.getElementById("selection-overlay");

    if (panel) {
      panel.style.zIndex = isOpen ? "10" : "1000";
    }

    if (selectionOverlay) {
      selectionOverlay.style.zIndex = isOpen ? "9" : "999";
    }
  }, [isOpen]);
  const downloadHandler = async () => {
    setIsDownloading(true);
    try {
      const container = await createDownloadContainer(data, pakoValue);
      const dataUrl = await generateImage(container);
      downloadImage(dataUrl, data.title);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const debugHandler = () => {
    window.open(`https://mermaid.live/edit#pako:${pakoValue}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        <h2 style={styles.title}>{data.title}</h2>
        <p style={styles.content}>{data.description}</p>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              setActiveTab("preview");
            }
          }}
        >
          <DialogTrigger asChild>
            <button type="button" style={styles.button}>
              View Mindmap
            </button>
          </DialogTrigger>
          <DialogContent style={styles.dialogContent} id="tsw-mindmap-content">
            <DialogHeader>
              <DialogTitle>{data.title}</DialogTitle>
            </DialogHeader>

            <div style={styles.imageContainer}>
              <Tabs defaultValue="preview" style={styles.tabsContent}>
                <TabsList style={styles.tabsList}>
                  <TabsTrigger
                    value="preview"
                    style={{
                      ...styles.tabsTrigger,
                      ...(activeTab === "preview"
                        ? styles.tabsTriggerActive
                        : {}),
                    }}
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    style={{
                      ...styles.tabsTrigger,
                      ...(activeTab === "code" ? styles.tabsTriggerActive : {}),
                    }}
                    onClick={() => setActiveTab("code")}
                  >
                    Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  {pakoValue &&
                    (errorMessage ? (
                      <div style={styles.errorContainer}>
                        <pre>
                          <code style={styles.error}>{errorMessage}</code>
                          <div>
                            Please view 'Code' tab for details or access{" "}
                            <a
                              href={`https://mermaid.live/edit#pako:${pakoValue}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Mermaid Editor
                            </a>{" "}
                            to debug.
                          </div>
                        </pre>
                      </div>
                    ) : (
                      <>
                        {isLoading && <Loading message="Loading image" />}
                        <img
                          src={`${imageSrc}`}
                          alt="mermaid"
                          id="mermaindDiagram"
                          style={{
                            ...styles.diagram,
                            display: isLoading ? "none" : "block",
                          }}
                          onLoad={() => {
                            setErrorMessage("");
                            setIsLoading(false);
                          }}
                        />
                      </>
                    ))}
                  <div className={chatStyles.tswToolBar}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={downloadHandler}
                      className={cn(
                        commontyles.tswActionBtn,
                        shadcnStyles.tswTriggerButton,
                      )}
                      disabled={isDownloading}
                    >
                      <DownloadIcon
                        size={16}
                        className={iconsStyles.dynamicIcon}
                      />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="code">
                  <div>
                    <pre style={styles.codeBlock}>
                      <code style={styles.codeContent}>{data.diagram}</code>
                    </pre>
                  </div>
                  <div className={chatStyles.tswToolBar}>
                    <CopyToClipboard
                      content={data.diagram}
                      className={cn(
                        commontyles.tswActionBtn,
                        shadcnStyles.tswTriggerButton,
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={debugHandler}
                      className={cn(
                        commontyles.tswActionBtn,
                        shadcnStyles.tswTriggerButton,
                      )}
                      disabled={isDownloading}
                    >
                      <img
                        src={mermaidSvg}
                        alt="mermaid"
                        style={styles.mermaidSvg}
                      />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Mindmap;

const createDownloadContainer = async (
  data: MindmapData,
  pakoValue: string | null,
) => {
  const tempContainer = document.createElement("div");
  tempContainer.style.backgroundColor = "#ffffff";
  tempContainer.style.padding = "20px";
  tempContainer.style.width = "800px";

  const titleElement = document.createElement("h2");
  titleElement.textContent = data.title;
  titleElement.style.textAlign = "left";
  titleElement.style.marginBottom = "10px";
  titleElement.style.fontFamily = "Arial, sans-serif";
  titleElement.style.fontSize = "18px";
  titleElement.style.color = "#333";
  tempContainer.appendChild(titleElement);

  const newImage = new Image();
  newImage.crossOrigin = "anonymous";
  newImage.style.maxWidth = "100%";
  newImage.style.height = "auto";
  newImage.style.display = "block";
  newImage.style.margin = "20px auto";

  await new Promise((resolve, reject) => {
    newImage.onload = () => resolve(true);
    newImage.onerror = reject;
    newImage.src = `${mermaidURL}/pako:${pakoValue}?type=png`;
  });

  tempContainer.appendChild(newImage);

  const sourceElement = document.createElement("div");
  sourceElement.textContent = `Source: ${window.location.href}`;
  sourceElement.style.textAlign = "left";
  sourceElement.style.marginTop = "10px";
  sourceElement.style.color = "#666";
  sourceElement.style.fontSize = "12px";
  sourceElement.style.fontFamily = "Arial, sans-serif";
  tempContainer.appendChild(sourceElement);

  document.body.appendChild(tempContainer);
  tempContainer.style.position = "fixed";
  tempContainer.style.top = "0";
  tempContainer.style.left = "0";
  tempContainer.style.zIndex = "-1000";
  tempContainer.style.opacity = "1";
  return tempContainer;
};

const generateImage = async (container: HTMLElement) => {
  document.body.appendChild(container);
  try {
    return await htmlToImage.toPng(container, {
      quality: 1.0,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      skipAutoScale: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
  } finally {
    document.body.removeChild(container);
  }
};

const downloadImage = (dataUrl: string, title: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${title.toLowerCase().replace(/ /g, "-")}.png`;
  link.click();
};
