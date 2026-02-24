import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function getUserFromSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number }

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    })

    return user
  } catch {
    return null
  }
}