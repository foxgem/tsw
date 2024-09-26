import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileKey, SquareCode, SquarePen } from "lucide-react";
import Spinner from "./Spinner";
import { explainCode, rewriteCode } from "@/utils/ai";
import { cn } from "@/lib/utils";
import { TAB_CSS, TABCONTENT_CSS } from "@/utils/constants";
import SelectLang from "./SelectLang";
import { Button } from "./ui/button";

interface CodeWrapperProps {
  children: React.ReactNode;
}

const CodeWrapper: React.FC<CodeWrapperProps> = ({ children }) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [explainContent, setExplainContent] = useState("");
  const [rewriteContent, setRewriteContent] = useState("");

  const getChildrenContent = () => {
    if (React.isValidElement(children)) {
      if (children.props.children) {
        return typeof children.props.children === "string" ? children.props.children : null;
      }
      if (children.props.value) {
        return children.props.value;
      }
      if (children.props.dangerouslySetInnerHTML?.__html) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = children.props.dangerouslySetInnerHTML.__html;
        return tempDiv.innerText;
      }
    } else if (typeof children === "string") {
      return children;
    }
    return null;
  };

  const handleExplainClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    const tabs = trigger.closest(".tsw-code-wrapper");
    if (!tabs) return;

    const codeExplain = tabs.querySelector('div[data-state="active"] #tsw-code-explainer');
    if (!codeExplain) return;

    if (explainContent) {
      codeExplain.innerHTML = explainContent;
      return;
    }

    setIsExplaining(true);
    const code = getChildrenContent();
    const result = await explainCode(code);
    codeExplain.innerHTML = result;
    setExplainContent(result);
    setIsExplaining(false);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleRewriteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    if (rewriteContent) {
      loadCodeRewriter(trigger, rewriteContent);
    }
  };

  const handleRewriteSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    if (rewriteContent) {
      loadCodeRewriter(trigger, rewriteContent);
      return;
    }

    setIsRewriting(true);
    const code = getChildrenContent();
    const result = await rewriteCode(code, selectedLanguage);
    loadCodeRewriter(trigger, result);
    setRewriteContent(result);
    setIsRewriting(false);
  };

  const loadCodeRewriter = (trigger: EventTarget & HTMLButtonElement, content: string) => {
    const tabs = trigger.closest(".tsw-code-wrapper");
    if (!tabs) return;

    const codeRewriter = tabs.querySelector('div[data-state="active"] #tsw-code-rewriter');
    if (!codeRewriter) return;

    if (content) {
      codeRewriter.innerHTML = content;
      return;
    }
  };

  return (
    <div className="tsw-code-wrapper">
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="p-0">
          <TabsTrigger value="code" className={cn(TAB_CSS)}>
            <SquareCode className="mr-1" />
            Code
          </TabsTrigger>
          <TabsTrigger
            value="explain"
            className={cn(TAB_CSS)}
            onClick={(e) => handleExplainClick(e)}
          >
            <FileKey className="mr-1" />
            Explain
          </TabsTrigger>
          <TabsTrigger value="write" className={cn(TAB_CSS)} onClick={(e) => handleRewriteClick(e)}>
            <SquarePen className="mr-1" />
            Rewrite
          </TabsTrigger>
        </TabsList>
        <TabsContent value="code" className={cn(TABCONTENT_CSS)}>
          {children}
        </TabsContent>
        <TabsContent value="explain" className={cn(TABCONTENT_CSS)}>
          {isExplaining && <Spinner />}
          <div id="tsw-code-explainer"></div>
        </TabsContent>
        <TabsContent value="write" className={cn(TABCONTENT_CSS)}>
          <div className="flex items-center mb-2">
            <SelectLang lang={selectedLanguage} onLanguageChange={handleLanguageChange} />
            <Button
              onClick={(e) => handleRewriteSubmit(e)}
              className="ml-2 rounded bg-primary text-white transition-opacity duration-300 hover:bg-primary hover:opacity-50 font-bold"
            >
              Submit
            </Button>
          </div>

          <div id="tsw-code-rewriter"></div>
          {isRewriting && <Spinner />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeWrapper;
