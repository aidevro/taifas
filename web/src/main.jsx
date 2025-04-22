import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import Home from "./index.jsx";
import Dashboard from "./Dashboard.jsx";
import Meeting from "./components/Meeting.jsx"; // 👈 make sure this path is correct

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meeting/:id" element={<Meeting />} /> {/* 👈 add this */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
