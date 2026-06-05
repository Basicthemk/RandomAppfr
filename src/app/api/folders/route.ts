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

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        recordings: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const foldersWithCount = folders.map((folder) => ({
      ...folder,
      recordingCount: folder.recordings.length,
      recordings: undefined,
    }));

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error("GET /api/folders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "Folder with this name already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/folders error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
