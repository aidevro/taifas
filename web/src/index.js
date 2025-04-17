import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Meeting from "./components/Meeting";

ReactDOM.render(
    <Router>
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meeting/:id" element={<Meeting />} />
            <Route path="/" element={<Register />} />
        </Routes>
    </Router>,
    document.getElementById("root")
);
