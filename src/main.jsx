import React from "react";
import ReactDOM from "react-dom/client";
import TravelTracker from "./TravelTracker.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TravelTracker />
  </React.StrictMode>
);

// PWA: registra il service worker per installabilità e uso offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
