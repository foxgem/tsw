import { marked } from "marked";
import { useEffect, useState } from "react";
import { useAnimatedText } from "./use-animated-text";

interface StreamMessageProps {
  outputString: string;
  onStreamComplete?: (isComplete: boolean) => void;
}

export function StreamMessage({
  outputString,
  onStreamComplete,
}: StreamMessageProps) {
  const animatedText = useAnimatedText(outputString);
  const [parsedText, setParsedText] = useState("");

  useEffect(() => {
    const result = marked.parse(animatedText);
    if (typeof result === "string") {
      setParsedText(result);
    } else {
      result.then(setParsedText);
    }

    if (onStreamComplete) {
      onStreamComplete(animatedText === outputString);
    }
  }, [animatedText]);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: parsedText }} />
    </>
  );
}
