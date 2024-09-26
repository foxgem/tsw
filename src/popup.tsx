import React from "react";
import { MemoryRouter as Router, Route, Routes, } from "react-router-dom"
import MainPage from "./pages/home";
import TimerSettingPage from "./pages/timer-setting";
import { ThemeProvider } from "./components/ThemeProvider";
import AboutPage from "./pages/about";
import "./css/extention.css"

function IndexPopup() {

  return (
    <ThemeProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/timer-setting" element={<TimerSettingPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default IndexPopup;