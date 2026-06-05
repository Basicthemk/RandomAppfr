import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const query = req.nextUrl.searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search across title, description, transcript, and summaries
    const results = await prisma.recording.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { transcript: { contains: query, mode: "insensitive" } },
          { quickSummary: { contains: query, mode: "insensitive" } },
          { detailedNotes: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        folder: {
          select: { name: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ results, query });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
