import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import chatStyles from "~/css/chatui.module.css";
import commontyles from "~/css/common.module.css";
import iconsStyles from "~/css/icons.module.css";
import styles from "~/css/shadcn.module.css";
import { cn } from "~lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DownloadIcon } from "./ui/icons/download";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface ExportDialogProps {
  elementId: string;
  content: string;
  title?: string;
}

export function ExportDialog({
  content,
  elementId,
  title = "Chatting History",
}: ExportDialogProps) {
  const [exportType, setExportType] = useState<"image" | "pdf" | "markdown">(
    "image",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");

  const createStyledClone = async (contentDiv: Element, panel: HTMLElement) => {
    const clonedContent = contentDiv.cloneNode(true) as HTMLElement;

    const elementsToRemove = clonedContent.querySelectorAll(
      "iframe, canvas, video",
    );
    for (const element of elementsToRemove) {
      element.remove();
    }

    const images = clonedContent.getElementsByTagName("img");
    await Promise.all(
      Array.from(images).map(async (img) => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const tempImg = document.createElement("img");
          tempImg.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            tempImg.onload = () => {
              canvas.width = tempImg.width;
              canvas.height = tempImg.height;

              ctx.drawImage(tempImg, 0, 0);

              try {
                img.src = canvas.toDataURL("image/png");
              } catch (e) {
                console.warn("Failed to convert image to base64:", e);
              }
              resolve(null);
            };

            tempImg.onerror = () => {
              console.warn(`Failed to load image: ${img.src}`);
              resolve(null);
            };

            const timestamp = new Date().getTime();
            tempImg.src = img.src.includes("?")
              ? `${img.src}&_t=${timestamp}`
              : `${img.src}?_t=${timestamp}`;
          });
        } catch (e) {
          console.warn("Error processing image:", e);
        }
      }),
    );

    try {
      const originalStyles = window.getComputedStyle(contentDiv);
      for (const key of Array.from(originalStyles)) {
        try {
          clonedContent.style[key] = originalStyles.getPropertyValue(key);
        } catch (e) {
          console.warn(`Failed to set style property ${key}:`, e);
        }
      }

      const originalElements = contentDiv.getElementsByTagName("*");
      const clonedElements = clonedContent.getElementsByTagName("*");
      for (let i = 0; i < originalElements.length; i++) {
        try {
          const originalStyle = window.getComputedStyle(originalElements[i]);
          const element = clonedElements[i] as HTMLElement;
          for (const key of Array.from(originalStyle)) {
            try {
              element.style[key] = originalStyle.getPropertyValue(key);
            } catch (e) {
              console.warn(
                `Failed to set child element style property ${key}:`,
                e,
              );
            }
          }
        } catch (e) {
          console.warn(`Error processing element ${i}:`, e);
        }
      }
    } catch (e) {
      console.error("Error applying styles:", e);
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = document.title;
    titleElement.style.margin = "20px 0";
    titleElement.style.fontSize = "24px";
    titleElement.style.fontWeight = "bold";
    titleElement.style.textAlign = "center";
    titleElement.id = "titleElement";
    clonedContent.insertBefore(titleElement, clonedContent.firstChild);

    const footerElement = document.createElement("div");
    footerElement.textContent = `Source: ${window.location.href}`;
    footerElement.id = "footerElement";
    footerElement.style.cssText = `
        margin: 20px 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        color: #666;
        width: ${panel.scrollWidth}px;
    `;
    clonedContent.appendChild(footerElement);

    const tempContainer = document.createElement("div");
    tempContainer.id = "tempContainer";
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = `${panel.scrollWidth}px`;
    tempContainer.appendChild(clonedContent);

    document.body.appendChild(tempContainer);
    tempContainer.offsetHeight;
    const offsetHeight = titleElement.clientHeight + footerElement.clientHeight;
    return { clonedContent, tempContainer, offsetHeight };
  };

  const downloadFile = (url: string, type: "md" | "pdf" | "png") => {
    const link = document.createElement("a");
    link.download = `${document.title.toLowerCase().replace(/ /g, "-")}.${type}`;
    link.href = url;
    link.click();
  };

  const handleExport = async () => {
    setIsLoading(true);
    setDownloadStatus("");
    const panel = document.getElementById(elementId);
    const padding = 16;

    try {
      switch (exportType) {
        case "image":
        case "pdf": {
          if (!panel) {
            throw new Error("Target element not found");
          }

          const viewport = document.querySelector(
            "#tsw-output-body [data-radix-scroll-area-viewport]",
          );
          const contentDiv = viewport
            ? viewport.querySelector("div")
            : panel.querySelector("div");

          if (!contentDiv) {
            throw new Error("Content element not found");
          }

          const { clonedContent, tempContainer, offsetHeight } =
            await createStyledClone(contentDiv, panel);

          try {
            const dataUrl = await htmlToImage
              .toPng(clonedContent, {
                backgroundColor: "#ffffff",
                height:
                  clonedContent.clientHeight +
                  padding * 2 +
                  (viewport ? 0 : offsetHeight * 2),
                width: panel.scrollWidth + padding * 2,
                style: {
                  maxHeight: "none",
                  overflow: "visible",
                  padding: `${padding}px`,
                  boxSizing: "border-box",
                  transform: "scale(1)",
                },
                quality: 1,
                skipAutoScale: true,
                cacheBust: true,
                imagePlaceholder:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
              })
              .catch((err) => {
                console.error("Detailed error:", err);
                throw err;
              });

            setTimeout(() => {
              if (tempContainer?.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
              }
            }, 100);

            if (exportType === "image") {
              downloadFile(dataUrl, "png");
            } else {
              const pdf = new jsPDF();
              const imgProps = pdf.getImageProperties(dataUrl);
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const contentWidth = pageWidth;
              const contentHeight =
                (imgProps.height * contentWidth) / imgProps.width;
              const pageCount = Math.ceil(contentHeight / pageHeight);

              for (let i = 0; i < pageCount; i++) {
                if (i > 0) pdf.addPage();
                const yOffset = i === 0 ? 0 : -(i * pageHeight);
                pdf.addImage(
                  dataUrl,
                  "PNG",
                  0,
                  yOffset,
                  contentWidth,
                  contentHeight,
                  undefined,
                  "FAST",
                  0,
                );
              }

              const pdfOutput = pdf.output("blob");
              const pdfUrl = URL.createObjectURL(pdfOutput);
              downloadFile(pdfUrl, "pdf");
              URL.revokeObjectURL(pdfUrl);
            }
          } catch (error) {
            console.error("Failed to generate image:", error);
            throw new Error("Failed to generate image, please try again");
          }
          break;
        }

        case "markdown": {
          const text = `# ${document.title} \n\n${content}\n\nsource: ${window.location.href}`;
          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          downloadFile(url, "md");
          URL.revokeObjectURL(url);
          break;
        }
      }

      setDownloadStatus(
        `Downloaded as ${exportType.toUpperCase()} successfully!`,
      );
    } catch (error) {
      console.error("Export failed:", error);
      setDownloadStatus("Download failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const panel = document.getElementById("tsw-toggle-panel");
    const selectionOverlay = document.getElementById("selection-overlay");

    if (panel) {
      panel.style.zIndex = isOpen ? "10" : "1000";
    }

    if (selectionOverlay) {
      selectionOverlay.style.zIndex = isOpen ? "9" : "999";
    }

    if (isOpen) {
      setDownloadStatus("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(commontyles.tswActionBtn, styles.tswTriggerButton)}
        >
          <DownloadIcon size={16} className={iconsStyles.dynamicIcon} />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(styles.dialogContent, styles.dialogOverlay)}>
        <DialogTitle>Dowload {title}</DialogTitle>
        <div className={chatStyles.dialogContentDiv}>
          <div className={chatStyles.dialogContentRadioDiv}>
            <RadioGroup
              value={exportType}
              onValueChange={(value) => {
                setDownloadStatus("");
                setExportType(value as "image" | "pdf" | "markdown");
              }}
              className={chatStyles.radioGroup}
            >
              <div className={chatStyles.radioItem}>
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image">Image</Label>
              </div>
              <div className={chatStyles.radioItem}>
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className={chatStyles.radioItem}>
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">Markdown</Label>
              </div>
            </RadioGroup>
          </div>

          {downloadStatus && (
            <div className={chatStyles.downloadStatus}>{downloadStatus}</div>
          )}

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className={chatStyles.downloadButton}
          >
            {isLoading ? <>Downloading...</> : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
