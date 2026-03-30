"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function PrivacyPage(){

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
Privacy Policy
</h1>

<p className="text-gray-500 text-[16px] leading-[1.8]">
This Privacy Policy explains how VoxLinker collects, uses, and protects your information when you use our platform. We are committed to safeguarding your privacy and ensuring transparency.
</p>

<p className="text-xs text-gray-400 mt-4">
Last updated: March 2026
</p>

</section>


{/* ===== CONTENT ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24">

<div className="terms-content">

<h2>1. Information We Collect</h2>
<p>
We collect information to provide better services and improve your experience on VoxLinker.
</p>

<ul>
<li>Personal information (name, email, account details)</li>
<li>Usage data (pages visited, clicks, interactions)</li>
<li>Device and browser information</li>
</ul>


<h2>2. How We Use Your Information</h2>
<p>
We use the collected data to operate, maintain, and improve our services.
</p>

<ul>
<li>To provide affiliate tracking and analytics</li>
<li>To personalize your experience</li>
<li>To improve platform performance</li>
<li>To communicate important updates</li>
</ul>


<h2>3. Cookies and Tracking</h2>
<p>
VoxLinker uses cookies and similar technologies to track activity and improve user experience.
</p>

<p>
Cookies help us understand how users interact with our platform and allow us to optimize performance and marketing efforts.
</p>


<h2>4. Data Sharing</h2>
<p>
We do not sell your personal data. However, we may share information with:
</p>

<ul>
<li>Affiliate partners and advertisers</li>
<li>Analytics providers</li>
<li>Service providers that help operate the platform</li>
</ul>


<h2>5. Data Security</h2>
<p>
We implement industry-standard security measures to protect your data from unauthorized access, misuse, or disclosure.
</p>

<p>
However, no system is completely secure, and we cannot guarantee absolute security.
</p>


<h2>6. Your Rights</h2>
<p>
You have the right to:
</p>

<ul>
<li>Access your personal data</li>
<li>Request corrections or updates</li>
<li>Request deletion of your data</li>
<li>Opt-out of certain data processing activities</li>
</ul>


<h2>7. Third-Party Services</h2>
<p>
Our platform may include links to third-party services. We are not responsible for their privacy practices.
</p>


<h2>8. Changes to This Policy</h2>
<p>
We may update this Privacy Policy from time to time. Continued use of VoxLinker after changes means you accept the updated policy.
</p>


<h2>9. Contact Us</h2>
<p>
If you have any questions about this Privacy Policy, please contact us:
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