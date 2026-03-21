import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {

  const cookieHeader = req.headers.get("cookie")

  if (!cookieHeader) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const tokenMatch = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("token="))

  const token = tokenMatch?.split("=")[1]

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as { userId: number }

  const userId = decoded.userId

  let user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  if (!user.publisherId || !user.apiKey) {

    user = await prisma.user.update({
      where: { id: userId },
      data: {
        publisherId:
          "PUB-" +
          crypto.randomBytes(3).toString("hex").toUpperCase(),

        apiKey:
          crypto.randomBytes(24).toString("hex")
      }
    })

  }

  return NextResponse.json({
    publisherId: user.publisherId,
    apiKey: user.apiKey
  })

}