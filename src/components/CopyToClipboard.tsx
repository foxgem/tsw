import { Check } from "lucide-react";
import { useState } from "react";
import iconsStyles from "~/css/icons.module.css";
import { Button } from "./ui/button";
import { CopyIcon } from "./ui/icons/copy";

interface CopyToClipboardProps {
  content: string;
  className?: string;
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  content,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={className}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={16} className={iconsStyles.dynamicIcon} />
      ) : (
        <CopyIcon size={16} className={iconsStyles.dynamicIcon} />
      )}
    </Button>
  );
};
