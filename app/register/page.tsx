"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { Country } from "country-state-city";
import zxcvbn from "zxcvbn";

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

  const passwordStrength = zxcvbn(password);

  const handleNext = () => {
    if (!email || !password) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
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

    setError("");
    setLoading(true);

    await fetch("/api/register", {
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
        trafficSource,
        trafficUrl,
      }),
    });

    router.push("/dashboard");
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

          <motion.img
  src="/images/phone-mockup.png"
  alt="Platform mobile preview"
  className="rounded-3xl drop-shadow-2xl"
  initial={{ y: 0 }}
  animate={{ y: [0, -12, 0] }}
  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
/>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#fff7f3] p-10">
        <div className="w-full max-w-2xl bg-white p-14 rounded-3xl shadow-xl">

          <div className="text-center mb-10">
            <div className="text-3xl font-semibold tracking-tight">
              <span className="text-gray-800">My</span>
              <span className="bg-gradient-to-r from-[#ffb48a] to-[#ff9a6c] bg-clip-text text-transparent">
                Platform
              </span>
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
                  className={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

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

                <div className="flex gap-4">
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
                  onChange={(selected) => setCountry(selected)}
                  maxMenuHeight={200}
                />

                <PhoneInput
                  country={"us"}
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  inputStyle={{ width: "100%", height: "48px", borderRadius: "12px", border: "1px solid #e5e7eb" }}
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