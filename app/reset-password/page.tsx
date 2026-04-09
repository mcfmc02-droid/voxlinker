"use client";

export const dynamic = "force-dynamic";


import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (password !== confirm) {
      return setMessage("Passwords do not match");
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7f3] px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">

        <h2 className="text-xl font-semibold text-center mb-6">
          Create new password
        </h2>

        {message && (
          <div className="bg-gray-100 text-sm p-3 rounded-xl mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm password"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button className="w-full py-3 rounded-xl bg-[#ff9a6c] text-white cursor-pointer">
            Reset password
          </button>

        </form>
      </div>
    </div>
  );
}