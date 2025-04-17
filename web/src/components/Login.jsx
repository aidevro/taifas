import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://158.179.43.153/api/login", { username, password });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zoomGray">
            <div className="bg-zoomWhite p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-zoomBlue mb-6 text-center">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zoomBlue"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zoomBlue"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-zoomBlue text-zoomWhite py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
