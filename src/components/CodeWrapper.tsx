import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileKey, SquareCode, SquarePen } from 'lucide-react';
import Spinner from './Spinner';
import { explainCode, rewriteCode } from '@/utils/ai';
import { cn } from '@/lib/utils';
import SelectLang from './SelectLang';
import "../css/wrapper.css"

interface CodeWrapperProps {
  codeBlock: string;
  originCodes: string;
}

const CodeWrapper: React.FC<CodeWrapperProps> = ({ codeBlock, originCodes }) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [explainContent, setExplainContent] = useState("");
  const [rewriteContent, setRewriteContent] = useState("");


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

    try {
      setIsExplaining(true);
      const result = await explainCode(originCodes);
      codeExplain.innerHTML = result;
      setExplainContent(result);
    } catch (e) {
      console.log(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setRewriteContent("")
  };

  const handleRewriteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    if (rewriteContent) {
      loadCodeRewriter(trigger, rewriteContent);
    }
  };

  const handleRewriteSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    if (!rewriteContent) {
      loadCodeRewriter(trigger, rewriteContent);
    }
    try {

      setIsRewriting(true);
      const result = await rewriteCode(originCodes, selectedLanguage);
      loadCodeRewriter(trigger, result);
      setRewriteContent(result);

    } catch (e) {
      console.log(e);
    } finally {
      setIsRewriting(false);
    }
  };

  const loadCodeRewriter = (trigger: EventTarget & HTMLButtonElement, content: string) => {
    const tabs = trigger.closest(".tsw-code-wrapper");
    if (!tabs) return;

    const codeRewriter = tabs.querySelector('div[data-state="active"] #tsw-code-rewriter');
    if (!codeRewriter) return;

    codeRewriter.innerHTML = content;
  };

  return (
    <div className="tsw-code-wrapper">
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="p-0">
          <TabsTrigger value="code" className={cn("tsw-tab")}>
            <SquareCode className="mr-1" />
            Code
          </TabsTrigger>
          <TabsTrigger
            value="explain"
            className={cn("tsw-tab")}
            onClick={(e) => handleExplainClick(e)}
          >
            <FileKey className="mr-1" />
            Explain
          </TabsTrigger>
          <TabsTrigger value="write" className={cn("tsw-tab")} onClick={(e) => handleRewriteClick(e)}
          >
            <SquarePen className="mr-1" />Rewrite
          </TabsTrigger>
        </TabsList>
        <TabsContent value="code" className={cn("tsw-tab-content")}>
          <div dangerouslySetInnerHTML={{ __html: codeBlock }} />
        </TabsContent>
        <TabsContent value="explain" className={cn("tsw-tab-content")} >
          {isExplaining &&
            <Spinner title="Explaining" />}
          <div id="tsw-code-explainer"></div>
        </TabsContent>
        <TabsContent value="write" className={cn("tsw-tab-content")} >
          <div className="tsw-select">
            <SelectLang lang={selectedLanguage} onLanguageChange={handleLanguageChange} />
            {!rewriteContent && (
              <button onClick={(e) => handleRewriteSubmit(e)} className='tsw-submit' disabled={isRewriting}>Submit{isRewriting}</button>
            )}
          </div>

          <div id="tsw-code-rewriter"></div>
          {isRewriting &&
            <Spinner title="Rewriting" />}

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeWrapper;
