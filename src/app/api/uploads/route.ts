import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/m4a",
  "video/mp4",
  "video/quicktime",
  "audio/mp3",
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Allowed: MP3, WAV, M4A, MP4, MOV" },
        { status: 400 }
      );
    }

    // In production, upload to S3. For now, save locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    // Create uploads directory if it doesn't exist (in production, this would be S3)
    // For now, we'll return a mock URL
    const audioUrl = `/uploads/${filename}`;

    // In a real app:
    // await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      audioUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("POST /api/uploads error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
