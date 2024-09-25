import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SquareCode, StickyNote } from 'lucide-react';
import Spinner from './Spinner';
import { explainCode } from '@/utils/ai';
import { cn } from '@/lib/utils';
import { TAB_CSS, TABCONTENT_CSS } from '@/utils/constants';

interface CodeWrapperProps {
  children: React.ReactNode;
}

const CodeWrapper: React.FC<CodeWrapperProps> = ({ children }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const handleExplainClick = async () => {
    const codeExplain = document.getElementById("tsw-code-explain");
    if (!codeExplain) return;

    if (content) {
      codeExplain.innerHTML = content;
      return
    }

    setIsLoading(true);
    const result = await explainCode(`
                    // For debugging
                    setInterval(async () => {
                      console.log(await chrome.storage.local.get());
                      console.log(timerStartedMap);
                      console.log(await storage.getAll());
                    }, 3000);
                    `)
    if (codeExplain) {
      codeExplain.innerHTML = result;
      setContent(result)
    }
    setIsLoading(false);
  };

  return (
    <div className="tsw-code-wrapper" >
      <Tabs defaultValue="code" className="w-full">
        <TabsList className='p-0'>
          <TabsTrigger value="code" className={cn(TAB_CSS)}
          ><SquareCode className="mr-1" />Code</TabsTrigger>
          <TabsTrigger value="explain" className={cn(TAB_CSS)} onClick={handleExplainClick}
          ><StickyNote className="mr-1" />Explain</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className={cn(TABCONTENT_CSS)}>
          {children}
        </TabsContent>
        <TabsContent value="explain" className={cn(TABCONTENT_CSS)} >
          {isLoading &&
            <Spinner />}
          <div id="tsw-code-explain"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeWrapper;