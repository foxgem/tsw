import React from "react";
import { cn } from "~/lib/utils";

import githubDark from "data-base64:/assets/github.svg";
import githubLight from "data-base64:/assets/github_light.svg";
import { GITHUB_ROOT } from "~/utils/constants";

interface FooterProps {
  className?: string;
  showDivider?: boolean;
}

export default function Footer({ className, showDivider }: FooterProps) {
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    if (chrome?.runtime) {
      const manifest = chrome.runtime.getManifest();
      setVersion(manifest.version);
    }
  }, []);

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 p-2 text-xs text-gray-500",
        className,
      )}
    >
      {showDivider && (
        <div
          data-orientation="horizontal"
          role="none"
          className="shrink-0 bg-border h-[1px] w-full my-6"
        ></div>
      )}

      <div className="flex justify-between items-center h-8 text-black dark:text-white w-full text-center px-5">
        <div>@Tiny Smart Worker v{version}</div>
        <a href={GITHUB_ROOT} target="_blank" rel="noreferrer noopener">
          <img
            src={githubLight}
            alt="githubLight"
            className="w-5 transition-opacity duration-300 hover:opacity-50 cursor-pointer dark:block hidden"
          />
          <img
            src={githubDark}
            alt="githubDark"
            className="w-5 transition-opacity duration-300 hover:opacity-50 cursor-pointer block dark:hidden"
          />
        </a>
      </div>
    </footer>
  );
}
