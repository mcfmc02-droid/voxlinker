import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    return NextResponse.json({
      exists: !!user,
    });
  } catch (err) {
    return NextResponse.json(
      { exists: false },
      { status: 500 }
    );
  }
}