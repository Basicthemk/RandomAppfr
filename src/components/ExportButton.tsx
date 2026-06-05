"use client";

import { showToast } from "@/lib/toast";

interface ExportButtonProps {
  recordingId: string;
  recordingTitle: string;
}

export function ExportButton({ recordingId, recordingTitle }: ExportButtonProps) {
  const handleExport = async (format: "markdown" | "txt" | "json") => {
    try {
      const res = await fetch(`/api/export?recordingId=${recordingId}&format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recordingTitle.replace(/\s+/g, "_")}.${
        format === "markdown" ? "md" : format === "txt" ? "txt" : "json"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported as ${format.toUpperCase()}`, "success");
    } catch (error) {
      showToast(`Failed to export as ${format}`, "error");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport("markdown")}
        className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export as Markdown
      </button>
      <button
        onClick={() => handleExport("txt")}
        className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
      >
        Export as Text
      </button>
      <button
        onClick={() => handleExport("json")}
        className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Export as JSON
      </button>
    </div>
  );
}
