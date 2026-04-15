// /lib/email/templates.ts

const baseTemplate = (content: string) => `
<div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:40px 20px">

  <div style="max-width:560px;margin:auto;background:white;border-radius:14px;padding:32px 28px">

    <div style="text-align:center;margin-bottom:28px">

  <!-- Light Logo -->
  <img 
    src="https://voxlinker.com/logo.svg" 
    width="140" 
    style="display:block;margin:auto" 
    class="light-logo"
  />

  <!-- Dark Logo -->
  <img 
    src="https://voxlinker.com/logo-dark.svg" 
    width="140" 
    style="display:none;margin:auto" 
    class="dark-logo"
  />

</div>

<style>
@media (prefers-color-scheme: dark) {
  .light-logo { display: none !important; }
  .dark-logo { display: block !important; }
}
</style>

    <!-- CONTENT -->
    ${content}

    <!-- DIVIDER -->
    <hr style="margin:30px 0;border:none;border-top:1px solid #eee" />

    <!-- LINKS -->
    <div style="text-align:center;margin-bottom:14px">

      <a href="https://voxlinker.com/privacy" style="color:#999;font-size:12px;margin:0 6px;text-decoration:none">Privacy</a>
      <span style="color:#ddd">•</span>

      <a href="https://voxlinker.com/terms" style="color:#999;font-size:12px;margin:0 6px;text-decoration:none">Terms</a>
      <span style="color:#ddd">•</span>

      <a href="https://voxlinker.com/cookies" style="color:#999;font-size:12px;margin:0 6px;text-decoration:none">Cookies</a>

    </div>

    <!-- FOOTER TEXT -->
    <div style="text-align:center">

      <p style="font-size:12px;color:#999;margin-bottom:6px">
        You're receiving this email because you signed up for VoxLinker.
      </p>

      <p style="font-size:12px;color:#bbb">
        © ${new Date().getFullYear()} VoxLinker. All rights reserved.
      </p>

    </div>

  </div>

</div>
`

// ===== WELCOME =====
export function welcomeEmail(name: string) {
  return baseTemplate(`

    <h2 style="color:#111;margin-bottom:16px">
      Welcome to VoxLinker 👋
    </h2>

    <p style="color:#333;margin-bottom:12px">
      Hi ${name},
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      We’re excited to have you on board. VoxLinker helps you transform your audience into a powerful revenue engine 
      through intelligent affiliate links and real-time performance tracking.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:20px">
      Your account has been successfully created and is currently under review. This step ensures quality 
      and maintains a high-performing ecosystem for all creators on the platform.
    </p>

    <div style="margin:20px 0;text-align:center">
      <span style="
        background:#fff3cd;
        padding:10px 16px;
        border-radius:8px;
        color:#856404;
        font-size:13px;
        display:inline-block
      ">
        Status: Pending Review
      </span>
    </div>

    <p style="color:#666;font-size:14px;margin-top:20px">
      You’ll receive another email as soon as your account is approved.
    </p>

    <p style="color:#666;font-size:14px;margin-top:24px;line-height:1.8">
  Best regards,<br/>
  <strong style="display:inline-block;margin-top:6px;letter-spacing:0.3px">
    The VoxLinker Team
  </strong>
</p>

  `)
}

// ===== APPROVED =====
export function approvedEmail(name: string) {
  return baseTemplate(`

    <h2 style="color:#16a34a;margin-bottom:16px">
      You're Approved 🎉
    </h2>

    <p style="color:#333;margin-bottom:12px">
      Hi ${name},
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      Great news — your account is now fully active and ready to go.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:20px">
      You can start creating smart affiliate links, track every click and conversion in real time,
      and maximize your revenue with full visibility and control.
    </p>

    <div style="text-align:center;margin:24px 0">
      <a href="https://voxlinker.com/login"
        style="
        display:inline-block;
        padding:12px 22px;
        background:#ff9a6c;
        color:white;
        border-radius:8px;
        text-decoration:none;
        font-weight:600;
        font-size:14px
      ">
        Go to Dashboard
      </a>
    </div>

    <p style="color:#666;font-size:14px">
      If you need help getting started, our team is always here to support you.
    </p>

    <p style="color:#666;font-size:14px;margin-top:24px;line-height:1.8">
  Best regards,<br/>
  <strong style="display:inline-block;margin-top:6px;letter-spacing:0.3px">
    The VoxLinker Team
  </strong>
</p>

  `)
}

// ===== REJECTED =====
export function rejectedEmail(name: string) {
  return baseTemplate(`

    <h2 style="color:#dc2626;margin-bottom:16px">
      Application Update
    </h2>

    <p style="color:#333;margin-bottom:12px">
      Hi ${name},
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      Thank you for your interest in VoxLinker.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      After careful review, we’re unable to approve your account at this time.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:20px">
      This decision is based on internal guidelines and quality standards. 
      You’re welcome to reapply in the future.
    </p>

    <p style="color:#666;font-size:14px">
      We appreciate your understanding.
    </p>

    <p style="color:#666;font-size:14px;margin-top:24px;line-height:1.8">
  Best regards,<br/>
  <strong style="display:inline-block;margin-top:6px;letter-spacing:0.3px">
    The VoxLinker Team
  </strong>
</p>

  `)
}

// ===== SUSPENDED =====
export function suspendedEmail(name: string) {
  return baseTemplate(`

    <h2 style="color:#dc2626;margin-bottom:16px">
      Account Status Update
    </h2>

    <p style="color:#333;margin-bottom:12px">
      Hi ${name},
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      We hope you're doing well.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:16px">
      After a thorough review of your account activity and overall compliance with our platform guidelines, 
      we regret to inform you that we are unable to continue working together at this time.
    </p>

    <p style="color:#555;line-height:1.7;margin-bottom:20px">
      This decision was made carefully by our team to maintain the quality, integrity, and long-term sustainability 
      of the VoxLinker ecosystem.
    </p>

    <div style="margin:20px 0;text-align:center">
      <span style="
        background:#fee2e2;
        padding:10px 16px;
        border-radius:8px;
        color:#b91c1c;
        font-size:13px;
        display:inline-block
      ">
        Status: Account Suspended
      </span>
    </div>

    <p style="color:#555;line-height:1.7;margin-top:20px">
      If you would like more information regarding this decision, you're welcome to contact our team. 
      We will do our best to provide clarification where possible.
    </p>

    <p style="color:#666;font-size:14px;margin-top:24px;line-height:1.8">
      Best regards,<br/>
      <strong style="display:inline-block;margin-top:6px;letter-spacing:0.3px">
        The VoxLinker Team
      </strong>
    </p>

  `)
}