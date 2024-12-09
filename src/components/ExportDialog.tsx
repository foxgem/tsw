import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { useState } from "react";
import chatStyles from "~/css/chatui.module.css";
import commontyles from "~/css/common.module.css";
import iconsStyles from "~/css/icons.module.css";
import styles from "~/css/shadcn.module.css";
import { cn } from "~lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { DownloadIcon } from "./ui/icons/download";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface Message {
  role: string;
  content: string;
}

interface ExportDialogProps {
  messages: Message[];
}

export function ExportDialog({ messages }: ExportDialogProps) {
  const [exportType, setExportType] = useState<"image" | "pdf" | "markdown">(
    "image",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");

  const createStyledClone = (contentDiv: Element, panel: HTMLElement) => {
    const clonedContent = contentDiv.cloneNode(true) as HTMLElement;

    const originalStyles = window.getComputedStyle(contentDiv);
    Array.from(originalStyles).forEach((key) => {
      clonedContent.style[key] = originalStyles.getPropertyValue(key);
    });

    const originalElements = contentDiv.getElementsByTagName("*");
    const clonedElements = clonedContent.getElementsByTagName("*");
    for (let i = 0; i < originalElements.length; i++) {
      const originalStyle = window.getComputedStyle(originalElements[i]);
      const element = clonedElements[i] as HTMLElement;
      Array.from(originalStyle).forEach((key) => {
        element.style[key] = originalStyle.getPropertyValue(key);
      });
    }

    const titleElement = document.createElement("h1");
    titleElement.textContent = document.title;
    titleElement.style.margin = "20px 0";
    titleElement.style.fontSize = "24px";
    titleElement.style.fontWeight = "bold";
    titleElement.style.textAlign = "center";
    clonedContent.insertBefore(titleElement, clonedContent.firstChild);

    const footerElement = document.createElement("div");
    footerElement.textContent = `source: ${window.location.href}`;
    footerElement.style.margin = "20px 0";
    footerElement.style.color = "#666";
    clonedContent.appendChild(footerElement);

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = `${panel.scrollWidth}px`;
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    return { clonedContent, tempContainer };
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
  };

  const handleExport = async () => {
    setIsLoading(true);
    setDownloadStatus("");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const panel = document.getElementById("tsw-chat-container");
    const padding = 16;

    try {
      switch (exportType) {
        case "image":
        case "pdf": {
          if (panel) {
            const viewport = document.querySelector(
              "[data-radix-scroll-area-viewport]",
            );
            const contentDiv = viewport.querySelector("div");
            const { clonedContent, tempContainer } = createStyledClone(
              contentDiv,
              panel,
            );

            const dataUrl = await htmlToImage.toPng(clonedContent, {
              backgroundColor: "#ffffff",
              height: clonedContent.clientHeight + padding * 2,
              width: panel.scrollWidth + padding * 2,
              style: {
                maxHeight: "none",
                overflow: "visible",
                padding: `${padding}px`,
                boxSizing: "border-box",
              },
            });

            document.body.removeChild(tempContainer);

            if (exportType === "image") {
              downloadFile(dataUrl, `chat-history-${timestamp}.png`);
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

              pdf.save(`chat-history-${timestamp}.pdf`);
            }
          }
          break;
        }

        case "markdown": {
          const text = `# ${document.title} \n

${messages.map((m) => `${m.role.toUpperCase()}:\n ${m.content}`).join("\n\n")}

source: ${window.location.href}`;

          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          downloadFile(url, `chat-history-${timestamp}.md`);
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
      <DialogContent className={styles.dialogContent}>
        <div className={chatStyles.dialogContentDiv}>
          <div className={chatStyles.dialogContentRadioDiv}>
            <h4 className={chatStyles.dialogChoseTitle}>
              Dowload Chatting History{" "}
            </h4>
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
