import { TimerReset } from "lucide-react";

import { Key } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  const gotoSummary = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, { action: "summarize" });
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        console.error("Unable to access current tab");
      }
    });
  };

  const gotoTimerSetting = () => {
    navigate("/timer-setting", {});
  };

  const gotoApiKeySetting = () => {
    navigate("/setting-api-key", {});
  };

  return (
    <div className="w-[350px] h-auto min-h-[246px] flex flex-col pb-12">
      <Header />
      <nav className="flex flex-col mx-auto px-5 mt-4 flex-1 w-[60%]">
        <Button
          variant="outline"
          onClick={() => gotoTimerSetting()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent  hover:bg-primary hover:text-white",
          )}
        >
          <TimerReset className="mr-2" />
          Timer Setting
        </Button>

        <Button
          variant="outline"
          onClick={() => gotoApiKeySetting()}
          className={cn(
            "px-4 py-2 rounded-full h-12 mb-3 border-0 justify-start",
            "cursor-pointer",
            "transition-colors duration-300",
            "bg-accent hover:bg-primary hover:text-white dark:text-white",
          )}
        >
          <Key className="mr-2" />
          Setting API KEY
        </Button>
      </nav>
      <Footer className="mt-auto" />
    </div>
  );
}

export default MainPage;
