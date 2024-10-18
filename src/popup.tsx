import React from "react";
import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import AboutPage from "./pages/about";
import MainPage from "./pages/home";
import TimerSettingPage from "./pages/timer-setting";

import SettingApiKey from "./pages/api-key-setting";

import "./css/extention.css";

function IndexPopup() {
  return (
    <ThemeProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/timer-setting" element={<TimerSettingPage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route path="/setting-api-key" element={<SettingApiKey />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default IndexPopup;
