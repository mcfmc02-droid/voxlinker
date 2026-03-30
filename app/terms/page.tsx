"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function TermsPage(){

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
Terms of Service
</h1>

<p className="text-gray-500 text-[16px] leading-[1.8]">
These Terms of Service govern your use of VoxLinker and its affiliate platform. By accessing or using our services, you agree to be bound by these terms.
</p>

<p className="text-xs text-gray-400 mt-4">
Last updated: March 2026
</p>

</section>


{/* ===== CONTENT ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24">

<div className="terms-content">

<h2>1. Introduction</h2>
<p>
Welcome to VoxLinker. These Terms of Service (“Terms”) govern your access to and use of our platform, tools, and services. VoxLinker is designed to empower creators, influencers, and publishers to monetize their content through affiliate partnerships.
</p>

<p>
By using our services, you confirm that you have read, understood, and agree to comply with these Terms. If you do not agree, you should discontinue use immediately.
</p>


<h2>2. Eligibility</h2>
<p>
You must be at least 18 years old to use VoxLinker. By registering, you confirm that all information provided is accurate and up to date.
</p>

<ul>
<li>You are responsible for maintaining the security of your account</li>
<li>You agree not to share login credentials</li>
<li>You must comply with all applicable laws</li>
</ul>


<h2>3. Platform Usage</h2>
<p>
VoxLinker provides tools for affiliate tracking, link generation, and performance analytics. You agree to use the platform only for lawful purposes and in accordance with these Terms.
</p>

<h3>Prohibited activities include:</h3>

<ul>
<li>Fraudulent traffic or fake conversions</li>
<li>Spam, misleading promotions, or deceptive content</li>
<li>Violating intellectual property rights</li>
<li>Attempting to bypass tracking systems</li>
</ul>


<h2>4. Affiliate Earnings</h2>
<p>
Earnings are generated based on valid conversions tracked through VoxLinker. We reserve the right to review and validate all transactions.
</p>

<ul>
<li>Invalid or suspicious activity may result in withheld earnings</li>
<li>Payment terms depend on advertiser agreements</li>
<li>Commissions may vary by campaign</li>
</ul>


<h2>5. Account Suspension</h2>
<p>
We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful activities.
</p>

<p>
Repeated violations, fraud, or abuse of the system may lead to permanent removal from the platform.
</p>


<h2>6. Intellectual Property</h2>
<p>
All content, trademarks, and technology related to VoxLinker are owned by us or our partners. You may not copy, distribute, or reuse any part of the platform without permission.
</p>


<h2>7. Limitation of Liability</h2>
<p>
VoxLinker is provided “as is” without warranties of any kind. We are not liable for:
</p>

<ul>
<li>Loss of revenue or business opportunities</li>
<li>Technical interruptions or downtime</li>
<li>Third-party platform issues</li>
</ul>


<h2>8. Changes to Terms</h2>
<p>
We may update these Terms from time to time. Continued use of the platform after updates constitutes acceptance of the revised Terms.
</p>


<h2>9. Contact Information</h2>
<p>
If you have any questions about these Terms, please contact us at:
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