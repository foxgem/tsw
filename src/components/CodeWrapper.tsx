import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileKey, SquareCode, SquarePen, StickyNote } from 'lucide-react';
import Spinner from './Spinner';
import { explainCode } from '@/utils/ai';
import { cn } from '@/lib/utils';
import { TAB_CSS, TABCONTENT_CSS } from '@/utils/constants';
import SelectLang from './SelectLang';

interface CodeWrapperProps {
  children: React.ReactNode;
}

const CodeWrapper: React.FC<CodeWrapperProps> = ({ children }) => {

  const [isExplaining, setIsExplaining] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("Java");

  const [content, setContent] = useState('');

  const getChildrenContent = () => {
    if (React.isValidElement(children)) {
      if (children.props.children) {
        return children.props.children;
      }
      return children.props.value || children.props.dangerouslySetInnerHTML?.__html;
    } else if (typeof children === 'string') {
      return children;
    }
    return null;
  };

  const handleExplainClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    const tabs = trigger.closest('.tsw-code-wrapper');
    if (!tabs) return;

    const codeExplain = tabs.querySelector('div[data-state="active"] #tsw-code-explain');
    if (!codeExplain) return;

    if (!codeExplain) return;

    if (content) {
      codeExplain.innerHTML = content;
      return
    }

    setIsExplaining(true);
    const code = getChildrenContent()
    const result = await explainCode(code)
    codeExplain.innerHTML = result;
    setContent(result)
    setIsExplaining(false);
  };


  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    console.log(language)
    setIsRewriting(true)

  };

  return (
    <div className="tsw-code-wrapper" >
      <Tabs defaultValue="code" className="w-full">
        <TabsList className='p-0'>
          <TabsTrigger value="code" className={cn(TAB_CSS)}
          >
            <SquareCode className="mr-1" />Code
          </TabsTrigger>
          <TabsTrigger value="explain" className={cn(TAB_CSS)} onClick={(e) => handleExplainClick(e)}
          >
            <FileKey className="mr-1" />Explain
          </TabsTrigger>
          <TabsTrigger value="write" className={cn(TAB_CSS)}
          >
            <SquarePen className="mr-1" />Rewrite
          </TabsTrigger>
        </TabsList>
        <TabsContent value="code" className={cn(TABCONTENT_CSS)}>
          {children}
        </TabsContent>
        <TabsContent value="explain" className={cn(TABCONTENT_CSS)} >
          {isExplaining &&
            <Spinner />}
          <div id="tsw-code-explain"></div>

        </TabsContent>
        <TabsContent value="write" className={cn(TABCONTENT_CSS)} >
          <SelectLang lang={selectedLanguage} onLanguageChange={handleLanguageChange} />
          {isRewriting &&
            <Spinner />}

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeWrapper;