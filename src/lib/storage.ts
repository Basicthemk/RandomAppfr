// File storage utilities
// Currently using local storage, but can be extended for S3

export async function uploadFileToStorage(
  file: File
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
}

export function generateSignedUrl(key: string): string {
  // In production, generate AWS S3 signed URL
  return `${process.env.NEXT_PUBLIC_APP_URL}/uploads/${key}`;
}

export async function deleteFromStorage(key: string): Promise<void> {
  // In production, delete from AWS S3
  console.log("Deleting:", key);
}
