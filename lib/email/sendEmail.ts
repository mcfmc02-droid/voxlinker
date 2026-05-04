import { Resend } from "resend"

// ✅ تأكد أن المفتاح صحيح
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    console.log("📤 Sending email to:", to)
    
    const data = await resend.emails.send({
      from: "VoxLinker <community@voxlinker.com>",
      to: [to], // ✅ يجب أن تكون مصفوفة
      subject,
      html,
      // ✅ أضف هذه للتحسين
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    })

    console.log("✅ Email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("❌ EMAIL ERROR:", JSON.stringify(error, null, 2))
    return { success: false, error }
  }
}