"use client";

import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff7f3] px-4">

      <div className="
        w-full max-w-md sm:max-w-lg
        bg-white
        p-6 sm:p-10 md:p-12
        rounded-2xl sm:rounded-3xl
        shadow-xl sm:shadow-2xl
        text-center
      ">

        {/* ICON */}
        <div className="text-4xl sm:text-5xl mb-5 sm:mb-6">
          ⏳
        </div>

        {/* TITLE */}
        <h1 className="
          text-xl sm:text-2xl md:text-3xl
          font-bold
          mb-3 sm:mb-4
          leading-snug
        ">
          Application Received Successfully
        </h1>

        {/* DESCRIPTION */}
        <p className="
          text-gray-600
          text-sm sm:text-base
          mb-5 sm:mb-6
        ">
          Your registration request has been submitted.
          <br className="hidden sm:block" />
          Our team will review your application within
          <span className="font-semibold"> 24h – 72h.</span>
        </p>

        {/* SUBTEXT */}
        <p className="
          text-xs sm:text-sm
          text-gray-500
          mb-6 sm:mb-8
        ">
          You will receive an email notification once your account
          has been approved.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => router.push("/login")}
          className="
            w-full sm:w-auto
            bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c]
            text-white
            px-6 py-3
            rounded-xl
            font-medium
            hover:shadow-lg
            active:scale-[0.98]
            transition-all duration-200
            cursor-pointer
          "
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}