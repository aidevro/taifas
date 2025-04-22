// Full Home.jsx logic goes here (shortened here)
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Error logging in");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! You can now log in.");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Error registering");
      console.error(err);
    }
  };

  const handleJoinAsGuest = () => {
    navigate("/join-meeting");
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <CardContent>
          <h1 className="text-2xl font-bold text-center mb-6 text-violet-400">
            Welcome to Taifas Meet
          </h1>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
            <div className="flex flex-col gap-2 mt-4">
              <Button onClick={handleLogin} className="bg-violet-500 hover:bg-violet-600">
                Login
              </Button>
              <Button onClick={handleRegister} variant="outline" className="border-violet-400 text-violet-400 hover:bg-violet-900">
                Register
              </Button>
              <Button onClick={handleJoinAsGuest} variant="ghost" className="text-sm text-gray-400 hover:text-violet-300">
                Join as Guest
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
