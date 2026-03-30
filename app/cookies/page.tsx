"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function CookiesPage(){

return(

<div className="bg-white">

{/* ===== NAVBAR ===== */}
<Navbar />

{/* ===== HERO ===== */}
<section className="max-w-4xl mx-auto px-6 pt-20 pb-12">

<p className="text-sm text-[#ff9a6c] mb-3 uppercase tracking-wide">
Legal
</p>

<h1 className="text-[34px] md:text-[44px] font-semibold text-[#0f172a] leading-[1.2] mb-6">
Cookie Policy
</h1>

<p className="text-gray-500 text-[16px] leading-[1.8]">
This Cookie Policy explains how VoxLinker uses cookies and similar technologies to enhance your experience, analyze traffic, and support our affiliate tracking system.
</p>

<p className="text-xs text-gray-400 mt-4">
Last updated: March 2026
</p>

</section>


{/* ===== CONTENT ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24">

<div className="terms-content">

<h2>1. What Are Cookies</h2>
<p>
Cookies are small text files stored on your device when you visit a website. They help websites recognize your device, remember preferences, and improve overall user experience.
</p>

<p>
Cookies do not typically contain personally identifiable information, but they may be linked to personal data we store about you.
</p>


<h2>2. How We Use Cookies</h2>
<p>
VoxLinker uses cookies to operate efficiently and provide better services.
</p>

<ul>
<li>To enable affiliate tracking and attribution</li>
<li>To remember your preferences and settings</li>
<li>To analyze traffic and user behavior</li>
<li>To improve performance and functionality</li>
</ul>


<h2>3. Types of Cookies We Use</h2>

<h3>Essential Cookies</h3>
<p>
These cookies are necessary for the website to function properly. They enable core features such as login, security, and navigation.
</p>

<h3>Analytics Cookies</h3>
<p>
These cookies help us understand how users interact with our platform, allowing us to improve performance and user experience.
</p>

<h3>Marketing Cookies</h3>
<p>
Marketing cookies are used to track users across websites and deliver relevant advertisements or affiliate content.
</p>


<h2>4. Third-Party Cookies</h2>
<p>
We may allow third-party services such as analytics providers and affiliate partners to place cookies on your device.
</p>

<p>
These cookies are governed by the respective privacy policies of those third parties.
</p>


<h2>5. Managing Cookies</h2>
<p>
You can control or disable cookies through your browser settings. However, disabling cookies may affect the functionality of certain features on our platform.
</p>

<ul>
<li>Block all cookies</li>
<li>Delete existing cookies</li>
<li>Set preferences for specific websites</li>
</ul>


<h2>6. Changes to This Policy</h2>
<p>
We may update this Cookie Policy periodically. Continued use of VoxLinker after changes indicates your acceptance of the updated policy.
</p>


<h2>7. Contact Us</h2>
<p>
If you have any questions about our use of cookies, please contact us:
</p>

<p>
<strong>Email:</strong> community@voxlinker.com
</p>

</div>

</section>


{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}