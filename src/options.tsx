import { useEffect, useState } from "react";
import "./css/extention.css";
import Footer from "~components/Footer";
import { SettingsSidebar } from "~components/SettingsSidebar";
import { InstantInputs } from "~components/setting/InstantInputs";
import { ServiceSettings } from "~components/setting/ServiceSettings";
import { Timers } from "~components/setting/Timers";
import { initDb } from "~utils/storage";

export default function OptionsIndex() {
  const [selectedSection, setSelectedSection] = useState("timers");
  useEffect(() => {
    const init = async () => {
      await initDb();
    };
    init();
  }, []);
  return (
    <div className="min-h-screen flex flex-col text-sm">
      <div className="w-4/5 mx-auto p-6 flex-1">
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
            {selectedSection === "timers" && <Timers />}
            {selectedSection === "keys" && <ServiceSettings />}
            {selectedSection === "instant-inputs" && <InstantInputs />}
          </div>
        </div>
      </div>

      <Footer
        className="sticky bottom-0 bg-white w-4/5 mx-auto"
        showDivider={true}
      />
    </div>
  );
}
