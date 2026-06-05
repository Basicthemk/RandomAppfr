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

    const recordingId = req.nextUrl.searchParams.get("recordingId");
    const format = req.nextUrl.searchParams.get("format") || "markdown";

    if (!recordingId) {
      return NextResponse.json(
        { error: "Recording ID is required" },
        { status: 400 }
      );
    }

    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: { actionItems: true },
    });

    if (!recording || recording.userId !== user.id) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    let content = "";

    if (format === "markdown") {
      content = generateMarkdown(recording);
    } else if (format === "txt") {
      content = generatePlainText(recording);
    } else if (format === "json") {
      content = generateJSON(recording);
    }

    const filename = `${recording.title.replace(/\s+/g, "_")}.${format === "markdown" ? "md" : format === "txt" ? "txt" : "json"}`;

    return new NextResponse(content, {
      headers: {
        "Content-Type":
          format === "json"
            ? "application/json"
            : format === "markdown"
              ? "text/markdown"
              : "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateMarkdown(recording: any): string {
  const lines: string[] = [];

  lines.push(`# ${recording.title}`);
  lines.push("");

  if (recording.description) {
    lines.push(recording.description);
    lines.push("");
  }

  lines.push(`**Date:** ${new Date(recording.createdAt).toLocaleDateString()}`);
  if (recording.duration) {
    lines.push(
      `**Duration:** ${Math.floor(recording.duration / 60)} minutes`
    );
  }
  lines.push("");

  if (recording.quickSummary) {
    lines.push("## Quick Summary");
    lines.push(recording.quickSummary);
    lines.push("");
  }

  if (recording.detailedNotes) {
    lines.push("## Detailed Notes");
    lines.push(recording.detailedNotes);
    lines.push("");
  }

  if (recording.actionItems && recording.actionItems.length > 0) {
    lines.push("## Action Items");
    lines.push("");
    recording.actionItems.forEach((item: any) => {
      lines.push(
        `- [ ] ${item.task} (Owner: ${item.owner || "Unassigned"}${item.dueDate ? `, Due: ${new Date(item.dueDate).toLocaleDateString()}` : ""})`
      );
    });
    lines.push("");
  }

  if (recording.transcript) {
    lines.push("## Transcript");
    lines.push(recording.transcript);
  }

  return lines.join("\n");
}

function generatePlainText(recording: any): string {
  const lines: string[] = [];

  lines.push(recording.title.toUpperCase());
  lines.push("=".repeat(recording.title.length));
  lines.push("");

  if (recording.description) {
    lines.push(recording.description);
    lines.push("");
  }

  lines.push(`Date: ${new Date(recording.createdAt).toLocaleDateString()}`);
  if (recording.duration) {
    lines.push(`Duration: ${Math.floor(recording.duration / 60)} minutes`);
  }
  lines.push("");

  if (recording.quickSummary) {
    lines.push("QUICK SUMMARY");
    lines.push("-".repeat(15));
    lines.push(recording.quickSummary);
    lines.push("");
  }

  if (recording.detailedNotes) {
    lines.push("DETAILED NOTES");
    lines.push("-".repeat(14));
    lines.push(recording.detailedNotes);
    lines.push("");
  }

  if (recording.actionItems && recording.actionItems.length > 0) {
    lines.push("ACTION ITEMS");
    lines.push("-".repeat(12));
    recording.actionItems.forEach((item: any) => {
      lines.push(
        `• ${item.task} (Owner: ${item.owner || "Unassigned"}${item.dueDate ? `, Due: ${new Date(item.dueDate).toLocaleDateString()}` : ""})`
      );
    });
    lines.push("");
  }

  if (recording.transcript) {
    lines.push("TRANSCRIPT");
    lines.push("-".repeat(10));
    lines.push(recording.transcript);
  }

  return lines.join("\n");
}

function generateJSON(recording: any): string {
  return JSON.stringify(
    {
      title: recording.title,
      description: recording.description,
      date: new Date(recording.createdAt).toISOString(),
      duration: recording.duration,
      quickSummary: recording.quickSummary,
      detailedNotes: recording.detailedNotes,
      actionItems: recording.actionItems,
      transcript: recording.transcript,
    },
    null,
    2
  );
}
