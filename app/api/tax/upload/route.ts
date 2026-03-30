import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import { TaxFormType, TaxStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()

    const file = formData.get("file") as File
    const formType = formData.get("formType") as string
    const taxId = formData.get("taxId") as string
    const country = formData.get("country") as string

    // ✅ Validate form type
if (!["W9", "W8BEN"].includes(formType)) {
  return NextResponse.json(
    { error: "Invalid form type" },
    { status: 400 }
  )
}

    if (!file || !formType || !country) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // 🔥 Validate file type
    const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

const extension = file.name.split(".").pop()?.toLowerCase()

const allowedExtensions = ["pdf", "doc", "docx"]

if (
  !allowedMimeTypes.includes(file.type) ||
  !allowedExtensions.includes(extension || "")
) {
  return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
}

if (!extension || !allowedExtensions.includes(extension.toLowerCase())) {
  return NextResponse.json({ error: "Invalid file extension" }, { status: 400 })
}

if (file.size > 5 * 1024 * 1024) {
  return NextResponse.json({ error: "File too large" }, { status: 400 })
}

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    
    const fileName = `${user.id}_${Date.now()}.${extension}`

    const filePath = path.join(process.cwd(), "public/uploads", fileName)

    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    // 🔥 Save to DB
    const tax = await prisma.taxForm.upsert({
  where: { userId: user.id },
  update: {
    formType: formType as TaxFormType,
    taxId,
    country,
    fileUrl,
    status: TaxStatus.PENDING,
    updatedAt: new Date(),
  },
  create: {
    userId: user.id,
    formType: formType as TaxFormType,
    taxId,
    country,
    fileUrl,
    status: TaxStatus.PENDING,
  },
})

    return NextResponse.json({
      success: true,
      tax,
    })

  } catch (err) {
    console.error("TAX UPLOAD ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}