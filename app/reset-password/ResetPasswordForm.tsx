"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ نفس ستايل login
  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb48a]/40 focus:border-[#ff9a6c] transition-all duration-200";

  const primaryButton =
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white font-medium text-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer";

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (password !== confirm) {
      setSuccess(false);
      return setMessage("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSuccess(false);
        setMessage(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage("Your password has been updated successfully");

    } catch {
      setSuccess(false);
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7f3] px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">

        {/* ===== LOGO ===== */}
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

        <h2 className="text-xl font-semibold text-center mb-6">
          Create new password
        </h2>

        {/* ===== MESSAGE ===== */}
        {message && (
          <div
            className={`
              mb-6 text-sm px-4 py-3 rounded-xl text-center
              ${
                success
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }
            `}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="password"
            placeholder="New password"
            required
            className={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={success}
          />

          <input
            type="password"
            placeholder="Confirm password"
            required
            className={inputStyle}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={success}
          />

          {/* ===== BUTTON ===== */}
          {success ? (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className={primaryButton}
            >
              Back to login
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={primaryButton}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          )}

        </form>
      </div>
    </div>
  );
}