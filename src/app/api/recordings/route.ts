import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user
    const clerkUser = await auth();
    const user = await getOrCreateUser(userId, "email", "name");

    const recordings = await db.recording.findMany({
      where: { userId: user.id },
      include: {
        actionItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("GET /api/recordings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, audioUrl, folderId, duration, fileSize, mimeType } = body;

    if (!title || !audioUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(userId, "email", "name");

    const recording = await db.recording.create({
      data: {
        title,
        description,
        audioUrl,
        folderId,
        duration,
        fileSize,
        mimeType,
        userId: user.id,
      },
    });

    return NextResponse.json(recording, { status: 201 });
  } catch (error) {
    console.error("POST /api/recordings error:", error);
    return NextResponse.json(
      { error: "Failed to create recording" },
      { status: 500 }
    );
  }
}
