"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function AccessibilityPage(){

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
Accessibility Statement
</h1>

<p className="text-gray-500 text-[16px] leading-[1.8]">
VoxLinker is committed to ensuring digital accessibility for all users. We strive to continuously improve the user experience and apply relevant accessibility standards across our platform.
</p>

<p className="text-xs text-gray-400 mt-4">
Last updated: March 2026
</p>

</section>


{/* ===== CONTENT ===== */}
<section className="max-w-4xl mx-auto px-6 pb-24">

<div className="terms-content">

<h2>1. Our Commitment</h2>
<p>
We are committed to making VoxLinker accessible to everyone, including individuals with disabilities. Our goal is to create an inclusive platform that provides equal access and opportunity for all users.
</p>

<p>
We continuously evaluate and improve our platform to ensure accessibility standards are met and exceeded.
</p>


<h2>2. Accessibility Standards</h2>
<p>
We aim to follow best practices and standards defined by the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
</p>

<ul>
<li>Clear navigation and consistent structure</li>
<li>Readable typography and sufficient contrast</li>
<li>Keyboard navigability across key features</li>
<li>Responsive design for different devices</li>
</ul>


<h2>3. Ongoing Improvements</h2>
<p>
Accessibility is an ongoing effort. We regularly review our platform to identify areas for improvement and implement updates to enhance usability.
</p>

<p>
We also consider user feedback as an essential part of improving accessibility.
</p>


<h2>4. Known Limitations</h2>
<p>
While we strive for full accessibility, some areas of the platform may not yet fully meet accessibility standards.
</p>

<p>
We are actively working to address these limitations and improve the overall experience.
</p>


<h2>5. Assistive Technologies</h2>
<p>
VoxLinker is designed to be compatible with modern assistive technologies such as screen readers and keyboard navigation tools.
</p>

<ul>
<li>Support for keyboard-only navigation</li>
<li>Structured HTML for screen readers</li>
<li>Accessible form inputs and controls</li>
</ul>


<h2>6. Feedback and Support</h2>
<p>
We welcome your feedback on the accessibility of VoxLinker. If you encounter any accessibility barriers, please let us know.
</p>

<p>
We are committed to addressing issues promptly and improving your experience.
</p>

<p>
<strong>Email:</strong> support@voxlinker.com
</p>


<h2>7. Future Enhancements</h2>
<p>
We plan to introduce additional accessibility improvements, including enhanced keyboard navigation, better screen reader support, and customizable user preferences.
</p>

</div>

</section>


{/* ===== FOOTER ===== */}
<Footer />

</div>
)
}