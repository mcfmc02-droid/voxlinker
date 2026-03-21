import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// ================= VALIDATION =================

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ================= HANDLER =================

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, email, type, issue, message } = body

    // ===== VALIDATION =====
    if (!name || !email || !type || !issue || !message) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      )
    }

    // ===== EMAIL CONTENT =====

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2 style="margin-bottom:20px">New Contact Request</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Issue:</strong> ${issue}</p>

        <hr style="margin:20px 0"/>

        <p style="white-space:pre-line">${message}</p>

        <hr style="margin:20px 0"/>

        <p style="font-size:12px;color:#888">
          Sent from VoxLinker contact form
        </p>
      </div>
    `

    // ===== SEND EMAIL =====

    const data = await resend.emails.send({
      from: "VoxLinker <community@voxlinker.com>", 
      to: "community@voxlinker.com",
      replyTo: email, // 🔥 مهم جداً (تستطيع الرد مباشرة)
      subject: `VoxLinker Contact - ${type}`,
      html
    })

    // ===== SUCCESS =====

    return NextResponse.json({
      success: true,
      id: data?.data?.id
    })

  } catch (err) {
    console.error("CONTACT ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}