import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/sendEmail"
import { approvedEmail, rejectedEmail } from "@/lib/email/templates"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email, name, status } = body

    if (!email || !status) {
      return new Response("Invalid payload", { status: 400 })
    }

    if (status === "APPROVED") {
      await sendEmail({
        to: email,
        subject: "You're Approved 🎉",
        html: approvedEmail(name || "Creator"),
      })
    }

    if (status === "REJECTED") {
      await sendEmail({
        to: email,
        subject: "Application Update",
        html: rejectedEmail(name || "Creator"),
      })
    }

    return new Response("OK")
  } catch (err) {
    console.error("WEBHOOK ERROR:", err)
    return new Response("ERROR", { status: 500 })
  }
}