"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderManager } from "@/components/FolderManager";

export default function FoldersPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Folders</h1>
          <p className="text-gray-400 mt-2">
            Create, edit, and delete folders to organize your recordings
          </p>
        </div>

        {/* Folder Manager */}
        <div className="bg-gray-800 rounded-lg p-6">
          <FolderManager />
        </div>
      </div>
    </div>
  );
}
