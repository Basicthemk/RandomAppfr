import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "email", "name");
    const recordingId = params.id;

    const recording = await db.recording.findFirst({
      where: {
        id: recordingId,
        userId: user.id,
      },
      include: {
        actionItems: true,
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recording);
  } catch (error) {
    console.error("GET /api/recordings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "email", "name");
    const recordingId = params.id;
    const body = await req.json();

    const recording = await db.recording.findFirst({
      where: {
        id: recordingId,
        userId: user.id,
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const updated = await db.recording.update({
      where: { id: recordingId },
      data: body,
      include: {
        actionItems: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/recordings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update recording" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "email", "name");
    const recordingId = params.id;

    const recording = await db.recording.findFirst({
      where: {
        id: recordingId,
        userId: user.id,
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    await db.recording.delete({
      where: { id: recordingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/recordings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }
}
