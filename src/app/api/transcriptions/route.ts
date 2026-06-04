import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { transcribeAudio } from "@/lib/openai";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "email", "name");
    const { recordingId } = await req.json();

    if (!recordingId) {
      return NextResponse.json(
        { error: "Missing recordingId" },
        { status: 400 }
      );
    }

    // Verify recording belongs to user
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

    // Update status to processing
    await db.recording.update({
      where: { id: recordingId },
      data: { transcriptionStatus: "processing" },
    });

    // Download audio from URL and transcribe
    const audioResponse = await fetch(recording.audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();

    const result = await transcribeAudio(Buffer.from(audioBuffer));

    // Save transcript
    await db.recording.update({
      where: { id: recordingId },
      data: {
        transcript: result.text,
        transcriptionStatus: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      transcript: result.text,
    });
  } catch (error) {
    console.error("POST /api/transcriptions error:", error);

    // Update status to failed
    const { recordingId } = await req.json();
    if (recordingId) {
      await db.recording.update({
        where: { id: recordingId },
        data: { transcriptionStatus: "failed" },
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
