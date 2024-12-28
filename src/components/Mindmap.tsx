import * as htmlToImage from "html-to-image";
import { fromUint8Array } from "js-base64";
import { DownloadIcon } from "lucide-react";
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
import shadcnStyles from "~/css/shadcn.module.css";
import { cn } from "~lib/utils";
import { Loading } from "./Loading";
import { Button } from "./ui/button";

interface MindmapProps {
  data: MindmapData;
  onGenerate?: (pakoValue: string | null) => void;
}

export interface MindmapData {
  title: string;
  description: string;
  diagram: string;
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
    overflow: "scroll",
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
    gap: "16px",
    border: "1px solid var(--border)",
    backgroundColor: "white",
    padding: "24px",
    boxShadow: " 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a",
    transitionDuration: "200ms",
    height: "600px",
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
    height: "500px",
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
  error: {
    color: "red",
    textAlign: "center",
    width: "100%",
  },
} as const;

const mermaidURL = "https://mermaid.ink/img";

const Mindmap: React.FC<MindmapProps> = ({ data, onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pakoValue, setPakoValue] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  return (
    <div style={styles.container}>
      <div style={styles.cardWrapper}>
        <h2 style={styles.title}>{data.title}</h2>
        <p style={styles.content}>{data.description}</p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {pakoValue &&
                (imageError ? (
                  <div style={styles.error}>Failed to load mindmap image.</div>
                ) : (
                  <>
                    {isLoading && <Loading message="Loading image" />}
                    <img
                      src={`${mermaidURL}/pako:${pakoValue}?type=png`}
                      alt="mermaid"
                      id="mermaindDiagram"
                      style={{
                        ...styles.diagram,
                        display: isLoading ? "none" : "block",
                      }}
                      onError={() => {
                        setImageError(true);
                        setIsLoading(false);
                      }}
                      onLoad={() => {
                        setImageError(false);
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
                  <DownloadIcon size={16} />
                </Button>
              </div>
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
  sourceElement.textContent = `Source: ${window.location.origin}`;
  sourceElement.style.textAlign = "right";
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
