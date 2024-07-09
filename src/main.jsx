import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MapProvider } from "react-map-gl";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MapProvider>
        <App />
      </MapProvider>
    </BrowserRouter>
  </React.StrictMode>
);
