import { useState } from "react";

import "./css/extention.css";
import { SettingsSidebar } from "~components/SettingsSidebar";
import { Timers } from "~components/setting/Timers";
import Footer from "~components/Footer";
import { ServiceSettings } from "~components/setting/ServiceSettings";

export default function OptionsIndex() {
  const [selectedSection, setSelectedSection] = useState("timers");

  return (
    <div className="w-4/5 mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">
        Manage your settings for timer, keys and others.
      </p>
      <div
        data-orientation="horizontal"
        role="none"
        className="shrink-0 bg-border h-[1px] w-full my-6"
      ></div>
      <div className="flex justify-start gap-8">
        <SettingsSidebar
          onSelect={(key) => {
            setSelectedSection(key);
          }}
          selected={selectedSection}
        />

        <div className="space-y-8 w-full">
          {selectedSection === "timers" && (
            <>
              <Timers />
            </>
          )}
          {selectedSection === "keys" && (
            <>
              {" "}
              <ServiceSettings />
            </>
          )}
        </div>
      </div>

      <Footer className="w-4/5 mx-auto p-6" showDivider={true} />
    </div>
  );
}
