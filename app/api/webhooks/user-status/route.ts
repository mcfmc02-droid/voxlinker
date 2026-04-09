import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendEmail } from "@/lib/email/sendEmail"
import { approvedEmail, rejectedEmail } from "@/lib/email/templates"

export async function POST(req: Request) {
  try {
    /* ========= SECURITY: VERIFY SECRET ========= */
    const signature = req.headers.get("x-webhook-signature")

    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rawBody = await req.text()

    const expectedSignature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    /* ========= PARSE BODY ========= */
    const body = JSON.parse(rawBody)

    const { email, name, status } = body

    if (!email || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    /* ========= EMAIL LOGIC ========= */
    if (status === "ACTIVE") {
      sendEmail({
        to: email,
        subject: "You're approved 🎉",
        html: approvedEmail(name || "User"),
      }).catch((err) => console.error("Email failed:", err))
    }

    if (status === "REJECTED") {
      sendEmail({
        to: email,
        subject: "Application update",
        html: rejectedEmail(name || "User"),
      }).catch((err) => console.error("Email failed:", err))
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("WEBHOOK ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}