export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const tokenMatch = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="));

    const token = tokenMatch?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };

    const userId = decoded.userId;

    const totalClicks = await prisma.click.count({
      where: { userId },
    });

    const totalConversions = await prisma.conversion.count({
      where: { userId },
    });

    const earnings = await prisma.conversion.aggregate({
      where: {
        userId,
        status: "APPROVED",
      },
      _sum: {
        commission: true,
      },
    });

    const totalEarnings = earnings._sum.commission || 0;

    const conversionRate =
      totalClicks > 0
        ? (totalConversions / totalClicks) * 100
        : 0;

    const epc =
      totalClicks > 0
        ? totalEarnings / totalClicks
        : 0;

    return NextResponse.json({
      totalClicks,
      totalConversions,
      totalEarnings,
      conversionRate,
      epc,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}