import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendEmail } from "@/lib/email/sendEmail"
import { approvedEmail, rejectedEmail } from "@/lib/email/templates"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("WEBHOOK BODY:", body)

    const { email, name, status } = body

    if (status === "APPROVED") {
      await sendEmail({
        to: email,
        subject: "You're Approved 🎉",
        html: approvedEmail(name),
      })
    }

    if (status === "REJECTED") {
      await sendEmail({
        to: email,
        subject: "Application Update",
        html: rejectedEmail(name),
      })
    }

    return new Response("OK")
  } catch (err) {
    console.error("WEBHOOK ERROR:", err)
    return new Response("ERROR", { status: 500 })
  }
}