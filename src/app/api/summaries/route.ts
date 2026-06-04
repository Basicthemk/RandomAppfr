import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateSummaries } from "@/lib/openai";
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

    if (!recording.transcript) {
      return NextResponse.json(
        { error: "Recording has no transcript" },
        { status: 400 }
      );
    }

    // Update status to processing
    await db.recording.update({
      where: { id: recordingId },
      data: { summaryStatus: "processing" },
    });

    // Generate summaries
    const summaries = await generateSummaries(recording.transcript);

    // Save summaries and action items
    await db.recording.update({
      where: { id: recordingId },
      data: {
        quickSummary: summaries.quickSummary,
        detailedNotes: summaries.detailedNotes,
        summaryStatus: "completed",
      },
    });

    // Create action items
    for (const item of summaries.actionItems) {
      await db.actionItem.create({
        data: {
          task: item.task,
          owner: item.owner || "Unassigned",
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          recordingId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quickSummary: summaries.quickSummary,
      detailedNotes: summaries.detailedNotes,
      actionItems: summaries.actionItems,
    });
  } catch (error) {
    console.error("POST /api/summaries error:", error);

    // Update status to failed
    const { recordingId } = await req.json().catch(() => ({}));
    if (recordingId) {
      await db.recording.update({
        where: { id: recordingId },
        data: { summaryStatus: "failed" },
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Failed to generate summaries" },
      { status: 500 }
    );
  }
}
