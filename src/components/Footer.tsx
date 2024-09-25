import { cn } from "@/lib/utils";
import React from "react";

import github from "data-base64:~assets/github.svg"
import { GITHUB_ROOT } from "@/utils/constants";
interface footerProps {
  position?: string;
}
export default function Footer({ position = "fixed" }: footerProps) {

  const [version, setVersion] = React.useState('');
  React.useEffect(() => {
    if (chrome && chrome.runtime) {
      const manifest = chrome.runtime.getManifest();
      setVersion(manifest.version);
    }
  }, []);

  return (
    <footer className={cn(position, "bottom-0 w-full")}>
      <div className="flex justify-between items-center mt-10 mb-2 h-8 text-black dark:text-white w-full text-center px-5">
        <div> @Tiny Smart Worker v{version}</div>
        <a href={GITHUB_ROOT} target="_blank"  rel="noreferrer noopener"><img src={github} className="w-5 transition-opacity duration-300 hover:opacity-50 cursor-pointer" /></a>
      </div>
    </footer>
  );
};

