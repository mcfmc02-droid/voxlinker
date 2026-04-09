import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: any) {
  console.log("🚀 SEND EMAIL CALLED")
  console.log("TO:", to)
  console.log("API KEY:", process.env.RESEND_API_KEY)

  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev", // مهم مؤقتًا
      to,
      subject,
      html,
    })

    console.log("✅ EMAIL SUCCESS:", res)

    return res
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error)
    throw error
  }
}