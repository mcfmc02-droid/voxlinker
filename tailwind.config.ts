import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class", // 🔥 هذا هو الحل
  content: [
    "./app/*/.{js,ts,jsx,tsx}",
    "./components/*/.{js,ts,jsx,tsx}",
  ],
}

export default config