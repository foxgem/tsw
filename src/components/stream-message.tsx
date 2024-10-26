import { marked } from "marked";
import { useEffect, useState } from "react";
import { useAnimatedText } from "./use-animated-text";

export function StreamMessage({ outputString }: { outputString: string }) {
  const animatedText = useAnimatedText(outputString);
  const [parsedText, setParsedText] = useState("");

  useEffect(() => {
    const result = marked.parse(animatedText);
    if (typeof result === "string") {
      setParsedText(result);
    } else {
      result.then(setParsedText);
    }
  }, [animatedText]);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: parsedText }} />
    </>
  );
}
