"use client";

import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7f3]">

      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg">

        <div className="text-5xl mb-6">⏳</div>

        <h1 className="text-3xl font-bold mb-4">
          Application Received Successfully
        </h1>

        <p className="text-gray-600 mb-6">
          Your registration request has been submitted.
          <br />
          Our team will review your application and respond within
          <span className="font-semibold"> 24h – 72h.</span>
        </p>

        <p className="text-sm text-gray-500 mb-8">
          You will receive an email notification once your account
          has been approved.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white px-6 py-3 rounded-xl hover:shadow-lg transition cursor-pointer"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}