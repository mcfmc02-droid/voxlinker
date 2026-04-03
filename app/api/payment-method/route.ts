import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { PayoutType } from "@prisma/client" // 🔥 مهم جداً

// ================= GET =================
export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ method: null })
    }

    const method = await prisma.paymentMethod.findUnique({
      where: { userId: user.id },
    })

    return NextResponse.json({ method })

  } catch (err) {
    console.error("GET PAYMENT METHOD ERROR:", err)
    return NextResponse.json({ method: null })
  }
}


// ================= POST =================
export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paypalEmail, accountHolder } = await req.json()

    if (!paypalEmail || !accountHolder) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const method = await prisma.paymentMethod.upsert({
      where: { userId: user.id },
      update: {
        paypalEmail,
        accountHolder,
        status: "ACTIVE",
        type: "PAYPAL",
      },
      create: {
        userId: user.id,
        paypalEmail,
        accountHolder,
        status: "ACTIVE",
        type: "PAYPAL",
      },
    })

    return NextResponse.json({ method })

  } catch (err) {
    console.error("POST PAYMENT METHOD ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}