export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED") {
  return NextResponse.json({
    message: "Account suspended",
    user: {
      status: "SUSPENDED",
    },
  });
}

   const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
    status: user.status, // مهم
  },
  process.env.JWT_SECRET!,
  { expiresIn: "7d" }
);

    const response = NextResponse.json({
  message: "Login successful",
  user: {
    id: user.id,
    email: user.email,
    role: user.role,      // 🔥 أضف هذا
    status: user.status,
  },
});

    response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 أيام
});

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
