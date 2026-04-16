// src/main.jsx — REACT'S ENTRY POINT
// ReactDOM.createRoot().render() is what "boots" React inside your index.html's <div id="root">
// Everything React renders lives inside that one div

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter enables React Router — URL-based navigation */}
    <BrowserRouter>
      {/* AuthProvider wraps everything so ALL components can access user state */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
