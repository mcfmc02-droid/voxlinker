import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/context/AuthContext"
import CookieBanner from "@/components/CookieBanner"

/* ===== FONTS ===== */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

/* ===== METADATA (PRO LEVEL) ===== */
export const metadata: Metadata = {
  title: {
    default: "VoxLinker",
    template: "%s | VoxLinker",
  },

  description:
    "Monetize your influence with powerful affiliate tools. Generate smart links, track performance, and maximize revenue.",

  keywords: [
    "affiliate marketing",
    "influencer monetization",
    "affiliate links",
    "creator tools",
    "earn money online",
  ],

  authors: [{ name: "VoxLinker" }],

  metadataBase: new URL("https://voxlinker.vercel.app"),

  openGraph: {
    title: "VoxLinker",
    description:
      "Monetize your influence with powerful affiliate tools.",
    url: "https://voxlinker.vercel.app",
    siteName: "VoxLinker",
    images: [
      {
        url: "/og-image.png", // (نضيفها لاحقاً)
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "VoxLinker",
    description:
      "Monetize your influence with powerful affiliate tools.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

/* ===== LAYOUT ===== */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🔥 منع المتصفح من فرض dark */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.style.colorScheme = 'light';
            `,
          }}
        />
      </head>

      <body
        className={`
          ${inter.variable}
          ${geistSans.variable}
          ${geistMono.variable}
          font-sans antialiased
          bg-white text-gray-900
        `}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        <CookieBanner />
      </body>
    </html>
  )
}