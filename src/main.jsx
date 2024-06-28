import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MapProvider } from "react-map-gl";
import { initializeApp } from "firebase/app";

import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyCXtIfrOkcg0Te-mY8t8KkrwxlZ0aqKPF0",
  authDomain: "night-time-economy-c0a4e.firebaseapp.com",
  projectId: "night-time-economy-c0a4e",
  storageBucket: "night-time-economy-c0a4e.appspot.com",
  messagingSenderId: "940436623314",
  appId: "1:940436623314:web:24c3c975580ad499fb020b",
};

const app = initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MapProvider>
        <App />
      </MapProvider>
    </BrowserRouter>
  </React.StrictMode>
);
