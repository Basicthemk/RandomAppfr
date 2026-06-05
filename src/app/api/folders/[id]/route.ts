import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.folder.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Move recordings to null (unassigned)
    await prisma.recording.updateMany({
      where: { folderId: params.id },
      data: { folderId: null },
    });

    // Delete folder
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
