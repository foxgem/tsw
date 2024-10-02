import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileKey, SquareCode } from "lucide-react";
import React, { useState } from "react";
import "../css/wrapper.css";
import Spinner from "./Spinner";
import { ocr } from "@/utils/ai";

interface ImgWrapperProps {
  imgSrc: string;
  imgBlock: string;
}

const ImgWrapper: React.FC<ImgWrapperProps> = ({ imgSrc, imgBlock }) => {
  const [isOcring, setIsOcring] = useState(false);
  const [ocrContent, setOcrContent] = useState("");

  const handleImageClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); 
    event.preventDefault(); 
  }

  const handleOcrClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); 
    event.preventDefault(); 
    const trigger = event.currentTarget;
    const tabs = trigger.closest(".tsw-code-wrapper");
    if (!tabs) return;

    const codeOcr = tabs.querySelector('div[data-state="active"] #tsw-code-ocr');
    if (!codeOcr) return;

    if (ocrContent) {
      codeOcr.innerHTML = ocrContent;
      return;
    }

    try {
      setIsOcring(true);
      const response = await fetch(imgSrc);
      const buffer = await response.arrayBuffer();
      const mimeType = response.headers.get("Content-Type") || "image/jpeg";
      const result = await ocr(Buffer.from(buffer), mimeType);
      codeOcr.innerHTML = result;
      setOcrContent(result);
    } catch (e) {
      console.log(e);
    } finally {
      setIsOcring(false);
    }
  };

  return (
    <div className="tsw-code-wrapper">
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="p-0">
          <TabsTrigger value="image" className={cn("tsw-tab")} onClick={(e) => handleImageClick(e)}>
            <SquareCode className="mr-1" />
            Image
          </TabsTrigger>
          <TabsTrigger value="ocr" className={cn("tsw-tab")} onClick={(e) => handleOcrClick(e)}>
            <FileKey className="mr-1" />
            OCR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="image" className={cn("tsw-tab-content")}>
          <div dangerouslySetInnerHTML={{ __html: imgBlock }} />
        </TabsContent>
        <TabsContent value="ocr" className={cn("tsw-tab-content")}>
          {isOcring && <Spinner title="OCRing" />}
          <div id="tsw-code-ocr"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImgWrapper;
