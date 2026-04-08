export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email/sendEmail";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      country,
      phone,
      address,
      stateRegion,
      city,
      trafficSource,
      trafficUrl,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: firstName + " " + lastName,
        role: "AFFILIATE",
        status: "PENDING",

        wallet: {
          create: {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarned: 0,
          },
        },
      },
    });

    // 🔥 SEND WELCOME EMAIL
try {
   sendEmail({
    to: user.email,
    subject: "Welcome to VoxLinker 🚀",
    html: welcomeEmail(user.name || "Creator"),
  });
} catch (e) {
  console.error("Email failed (register)", e);
}


    // تسجيل الدخول مباشرة ولكن بحالة PENDING
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Account created successfully",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}