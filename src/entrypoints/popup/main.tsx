import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "~/assets/css/extention.css";
ReactDOM.createRoot(document.getElementById("root") ?? document.body).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
