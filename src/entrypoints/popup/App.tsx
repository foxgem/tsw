import { HashRouter, Route, Routes } from "react-router-dom";
import SettingApiKey from "../../pages/api-key-setting";
import MainPage from "../../pages/home";
import TimerSettingPage from "../../pages/timer-setting";

function App() {
  return (
    <ThemeProvider>
      <div>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/timer-setting" element={<TimerSettingPage />} />
            <Route path="/setting-api-key" element={<SettingApiKey />} />
          </Routes>
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
