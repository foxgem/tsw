import { cn } from "@/lib/utils";
import React from "react";

import github from "data-base64:~assets/github.svg";
import { GITHUB_ROOT } from "@/utils/constants";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    if (chrome && chrome.runtime) {
      const manifest = chrome.runtime.getManifest();
      setVersion(manifest.version);
    }
  }, []);

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-2 text-xs text-gray-500 shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-center h-8 text-black dark:text-white w-full text-center px-5">
        <div>@Tiny Smart Worker v{version}</div>
        <a href={GITHUB_ROOT} target="_blank" rel="noreferrer noopener">
          <img
            src={github}
            className="w-5 transition-opacity duration-300 hover:opacity-50 cursor-pointer"
            alt="GitHub"
          />
        </a>
      </div>
    </footer>
  );
}
