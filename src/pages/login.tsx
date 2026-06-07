import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { House } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !API_URL) {
        throw new Error(data.message || "Authentication failed." || "CRITICAL ERROR: VITE_API_BASE_URL environment variable is not defined!");
      }
      // Set session variable flag to allow access to dashboard state
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userSession", username);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Connection error.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] font-sans text-stone-800 px-4">
      <div className="max-w-md w-full bg-[#FCFBF9] border border-[#EFE9DC] p-8 rounded-lg shadow-sm relative">
        <House
          className="absolute right-8 top-4 text-[#2C2416] cursor-pointer hover:opacity-70 transition-opacity duration-200"
          onClick={() => navigate("/")}
        />
        <h2 className="text-2xl font-light text-center tracking-tight mb-2 text-stone-900">
          Welcome Back
        </h2>
        <p className="text-xs text-center text-stone-500 mb-8">
          Access your protected area
        </p>

        {error && (
          <div className="mb-4 mt-3 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EFE9DC] rounded focus:outline-none focus:border-stone-400 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EFE9DC] rounded focus:outline-none focus:border-stone-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 text-xs uppercase tracking-widest font-medium bg-stone-800 text-[#FAF7F2] rounded hover:bg-stone-700 active:bg-stone-900 transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          New user?{" "}
          <Link
            to="/register"
            className="text-stone-800 underline hover:text-stone-600 transition"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
