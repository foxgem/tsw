import { cn } from "@/lib/utils";
import React from "react";


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
      <div className="flex justify-center items-center mt-10 mb-2 h-8 text-black dark:text-white w-full text-center">
        @Tiny Smart Worker v{version}
      </div>
    </footer>
  );
};

