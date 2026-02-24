"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb48a]/40 focus:border-[#ff9a6c] transition-all duration-200";

  const primaryButton =
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white font-medium text-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer";

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-20">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-semibold mb-6 text-black leading-tight">
            Welcome Back To Your Affiliate Dashboard
          </h1>

          <p className="text-gray-500 mb-10">
            Track performance, manage offers and scale your revenue effortlessly.
          </p>

          <motion.img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
            alt="Dashboard preview"
            className="rounded-3xl shadow-2xl"
            initial={{ y: 0 }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#fff7f3] p-10">
        <div className="w-full max-w-md bg-white p-14 rounded-3xl shadow-xl">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="text-3xl font-semibold tracking-tight">
              <span className="text-gray-800">My</span>
              <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
                Platform
              </span>
            </div>
          </div>

          {/* Error */}
          {message && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
            />

            <div className="text-right text-sm">
              <span
                onClick={() => router.push("/forgot-password")}
                className="text-[#ff9a6c] hover:underline cursor-pointer"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={primaryButton}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-[#ff9a6c] hover:underline cursor-pointer font-medium"
              >
                Create one
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}