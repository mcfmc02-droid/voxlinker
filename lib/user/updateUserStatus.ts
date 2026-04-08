import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email/sendEmail"
import { approvedEmail, rejectedEmail } from "@/lib/email/templates"

export async function updateUserStatus(userId: number, status: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  })

  /* ===== NAME ===== */
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name || "there"

  /* ===== EMAILS ===== */
  try {
    if (status === "ACTIVE") {
      await sendEmail({
        to: user.email,
        subject: "You're approved 🎉",
        html: approvedEmail(displayName),
      })
    }

    if (status === "REJECTED") {
      await sendEmail({
        to: user.email,
        subject: "Application rejected",
        html: rejectedEmail(displayName),
      })
    }
  } catch (err) {
    console.error("EMAIL SYSTEM ERROR:", err)
  }

  return user
}