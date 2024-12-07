import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import MainPage from "./pages/home";

import "./css/extention.css";

function IndexPopup() {
  return (
    <ThemeProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default IndexPopup;
