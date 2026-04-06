"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { Country } from "country-state-city";
import zxcvbn from "zxcvbn";
import Link from "next/link"

type CountryOption = {
  value: string;
  label: string;
};

export default function Register() {
  const router = useRouter();

  const countries: CountryOption[] = Country.getAllCountries().map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [trafficSource, setTrafficSource] = useState("");
  const [trafficUrl, setTrafficUrl] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("us");
  const [emailStatus, setEmailStatus] = useState<
  "idle" | "checking" | "valid" | "invalid" | "exists"
>("idle")
const [suggestion, setSuggestion] = useState<string | null>(null);

  const passwordStrength = zxcvbn(password);

  const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const emailFix = (email: string) => {
  const fixes: any = {
    "gmial.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmail.con": "gmail.com",
    "yaho.com": "yahoo.com",
  };

  const parts = email.split("@");
  if (parts.length !== 2) return null;

  const domain = parts[1];

  if (fixes[domain]) {
    return `${parts[0]}@${fixes[domain]}`;
  }

  return null;
};

  const checkEmail = async () => {
  try {
    const res = await fetch("/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    return data.exists;
  } catch (err) {
    console.error("Email check error:", err);
    return false;
  }
};

  const handleNext = async () => {
  if (!email || !password) {
    setError("Please complete all required fields.");
    return;
  }

  // ✅ التحقق من صيغة الإيميل
  if (!isValidEmail(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  // ✅ قوة الباسورد
  if (passwordStrength.score < 2) {
    setError("Please choose a stronger password.");
    return;
  }

  setLoading(true);

  // ✅ إذا عندك system real-time (emailStatus)
  if (emailStatus === "exists") {
    setError("This email is already registered.");
    setLoading(false);
    return;
  }

  if (emailStatus === "invalid") {
    setError("Invalid email format.");
    setLoading(false);
    return;
  }

  if (emailStatus !== "valid") {
  setError("Please enter a valid and available email.");
  return;
}

  // ✅ fallback check (في حالة debounce ما اشتغل)
  const exists = await checkEmail();

  if (exists) {
    setError("This email is already registered.");
    setLoading(false);
    return;
  }

  setError("");
  setLoading(false);
  setStep(2);
};

  const handleSubmit = async () => {
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !country ||
    !phone ||
    !address ||
    !stateRegion ||
    !city ||
    !trafficSource ||
    !trafficUrl ||
    !agree
  ) {
    setError("Please fill all fields and accept the terms.");
    return;
  }

  // URL validation (يحافظ على نفس الحقل)
  if (!trafficUrl.startsWith("http")) {
    setError("Please enter a valid URL (must start with http or https).");
    return;
  }

  setError("");
  setLoading(true);

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      country: country.value,
      phone,
      address,
      stateRegion,
      city,
      trafficSource, // كما هو (لا نكسر)
      trafficUrl,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error || "Registration failed");
    setLoading(false);
    return;
  }

  // ✅ التصحيح المطلوب
  router.push("/pending");
};

let emailTimeout: any;

const handleEmailChange = (value: string) => {
  setEmail(value);
  const fix = emailFix(value);
setSuggestion(fix);

  clearTimeout(emailTimeout);

  // تحقق من الفورمات
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setEmailStatus("invalid");
    return;
  }

  setEmailStatus("checking");

  // Debounce (نستنى المستخدم يوقف الكتابة)
  emailTimeout = setTimeout(async () => {
    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json();

      if (data.exists) {
        setEmailStatus("exists");
      } else {
        setEmailStatus("valid");
      }
    } catch {
      setEmailStatus("idle");
    }
  }, 600);
};

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb48a]/40 focus:border-[#ff9a6c] transition-all duration-200";

  const primaryButton =
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] text-white font-medium text-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer";

  const secondaryButton =
    "w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm transition-all duration-200 hover:bg-gray-50 cursor-pointer";

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-20">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-semibold mb-6 text-black leading-tight">
            Grow Faster With Smart Affiliate Technology
          </h1>
          <p className="text-gray-500 mb-10">
            Advanced CPA, RevShare & Hybrid engine built for serious publishers.
          </p>

          
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="
flex w-full lg:w-1/2 items-center justify-center
bg-[#fff7f3]

px-5 sm:px-8 lg:px-10
py-10 sm:py-12
">
        <div className="
w-full
max-w-[94%] sm:max-w-2xl

bg-white

p-6 sm:p-10 lg:p-14

rounded-2xl sm:rounded-3xl
shadow-xl
">

          <div className="text-center mb-8 sm:mb-10">
            <div className="text-3xl font-semibold tracking-tight">
              {/* ================= LOGO ================= */}

<div className="flex justify-center">
  <Link
  href="/"
  className="flex items-center justify-center group"
>
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
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Account Information</h2>

                <input
  type="email"
  placeholder="Email Address"
  className={`${inputStyle} ${
    emailStatus === "invalid" || emailStatus === "exists"
      ? "border-red-400"
      : emailStatus === "valid"
      ? "border-green-400"
      : ""
  }`}
  value={email}
  onChange={(e) => {
    const value = e.target.value;
    setEmail(value);
    handleEmailChange(value);
  }}
/>

{emailStatus === "checking" && (
  <p className="text-xs text-gray-400 mt-1">Checking email...</p>
)}

{emailStatus === "invalid" && (
  <p className="text-xs text-red-500 mt-1">Invalid email format</p>
)}

{emailStatus === "exists" && (
  <p className="text-xs text-red-500 mt-1">Email already exists</p>
)}

{emailStatus === "valid" && (
  <p className="text-xs text-green-500 mt-1">Email is available ✓</p>
)}

{suggestion && (
  <p className="text-xs text-gray-500 mt-1">
    Did you mean{" "}
    <span
      className="text-[#ff9a6c] cursor-pointer"
      onClick={() => {
  setEmail(suggestion);
  setSuggestion(null);
  handleEmailChange(suggestion);
  setError(""); // تنظيف أي خطأ قديم
}}
    >
      {suggestion}
    </span>
    ?
  </p>
)}

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className={inputStyle}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {password && (
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1
                            ? "bg-red-400 w-1/4"
                            : passwordStrength.score === 2
                            ? "bg-yellow-400 w-2/4"
                            : passwordStrength.score === 3
                            ? "bg-orange-400 w-3/4"
                            : "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                  )}
                </div>

                <button onClick={handleNext} className={primaryButton}>
                  Continue
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{" "}
                  <span
                    onClick={() => router.push("/login")}
                    className="text-[#ff9a6c] hover:underline cursor-pointer font-medium"
                  >
                    Go to Sign in
                  </span>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Personal & Address</h2>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className={inputStyle}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={inputStyle}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <Select
  options={countries}
  placeholder="Select a country"
  value={country}
  onChange={(selected) => {
    setCountry(selected);

    // تحويل اسم الدولة إلى ISO2
    const found = Country.getAllCountries().find(
      (c) => c.name === selected?.value
    );

    if (found?.isoCode) {
      setCountryCode(found.isoCode.toLowerCase());
    }
  }}
  maxMenuHeight={200}
/>
                <PhoneInput
  country={countryCode}
  value={phone}
  onChange={(value) => setPhone(value)}
  inputStyle={{
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  }}
/>

                <input
                  type="text"
                  placeholder="Street Address"
                  className={inputStyle}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="State / Region"
                    className={inputStyle}
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className={inputStyle}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <select
                  value={trafficSource}
                  onChange={(e) => setTrafficSource(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Traffic Source</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Blog">Blog</option>
                  <option value="Other">Other</option>
                </select>

                {trafficSource && (
                  <input
                    type="url"
                    placeholder="Profile or Website URL"
                    className={inputStyle}
                    value={trafficUrl}
                    onChange={(e) => setTrafficUrl(e.target.value)}
                  />
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="accent-[#ff9a6c] cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <span className="text-[#ff9a6c] hover:underline cursor-pointer">
                      Terms & Conditions
                    </span>
                  </span>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className={secondaryButton}>
                    Back
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={primaryButton}
                  >
                    {loading ? "Creating..." : "Finish"}
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{" "}
                  <span
                    onClick={() => router.push("/login")}
                    className="text-[#ff9a6c] hover:underline cursor-pointer font-medium"
                  >
                    Go to Sign in
                  </span>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}