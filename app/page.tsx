"use client"

import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import BrandMarquee from "@/components/landing/BrandMarquee"
import CreatorGrowth from "@/components/landing/CreatorGrowth"
import EarningsCalculator from "@/components/landing/EarningsCalculator"
import HowItWorks from "@/components/landing/HowItWorks"
import Features from "@/components/landing/Features"
import DashboardPreview from "@/components/landing/DashboardPreview"
import CTA from "@/components/landing/CTA"
import Footer from "@/components/landing/Footer"
import MobileShowcase from "@/components/landing/MobileShowcase"
import Testimonials from "@/components/landing/Testimonials"
import CaseStudies from "@/components/landing/CaseStudies"

export default function Home() {

return (

<main className="bg-[#fdfcf9] text-gray-900 overflow-hidden">

{/* NAVBAR */}
<Navbar />


{/* HERO */}
<Hero />

{/* BRAND MARQUEE */}
<BrandMarquee />


{/* MOBILE SHOWCASE */}
<MobileShowcase/>


{/* DASHBOARD PREVIEW */}
<DashboardPreview />



{/* EARNINGS CALCULATOR */}
<EarningsCalculator />

{/* CASE STUDIES */}
<CaseStudies />

{/* HOW IT WORKS */}
<HowItWorks />

{/* FEATURES */}
<Features />

{/* TESTIMONIALS */}
<Testimonials />


{/* CTA */}
<CTA />

{/* FOOTER */}
<Footer />

</main>

)

}