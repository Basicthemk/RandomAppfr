import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chatWithTranscript } from "@/lib/openai";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "email", "name");
    const { recordingId, question } = await req.json();

    if (!recordingId || !question) {
      return NextResponse.json(
        { error: "Missing recordingId or question" },
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

    if (!recording.transcript) {
      return NextResponse.json(
        { error: "Recording has no transcript" },
        { status: 400 }
      );
    }

    // Get answer from OpenAI using transcript context
    const answer = await chatWithTranscript(question, recording.transcript);

    // Save chat message
    const chat = await db.chat.create({
      data: {
        question,
        answer,
        userId: user.id,
        recordingId,
      },
    });

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      question,
      answer,
    });
  } catch (error) {
    console.error("POST /api/chats error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
