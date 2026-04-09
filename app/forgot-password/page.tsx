"use client";


import { useState } from "react";
import Link from "next/link";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb48a]/40 focus:border-[#ff9a6c]";

  const primaryButton =
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white font-medium text-sm cursor-pointer";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message);

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7f3] px-6">
      
      
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">

<div className="text-center mb-8 sm:mb-10">
  <div className="flex justify-center">
    <Link href="/" className="flex items-center justify-center group">
      <img
        src="/logo.svg"
        alt="VoxLinker"
        className="
          h-7 sm:h-8 md:h-9 lg:h-10
          w-auto
          transition duration-300
          group-hover:scale-[1.05]
        "
      />
    </Link>
  </div>
</div>

        <h2 className="text-xl font-semibold text-center mb-4">
          Reset your password
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we’ll send you a reset link
        </p>

        {message && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            required
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className={primaryButton} >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

      </div>
    </div>
  );
}