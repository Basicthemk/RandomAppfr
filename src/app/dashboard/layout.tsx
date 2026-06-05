"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Folder, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <Link href="/dashboard" className="text-2xl font-bold mb-8 text-blue-400">
          NoteFlow
        </Link>

        <Link href="/recording" className="mb-6">
          <Button className="w-full gap-2">
            <Plus size={20} /> New Recording
          </Button>
        </Link>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">FOLDERS</h3>
          <div className="space-y-2">
            <Link href="/dashboard/folders" className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <Settings size={18} />
              <span>Manage Folders</span>
            </Link>
            <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <Folder size={18} />
              <span>All Recordings</span>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <Folder size={18} />
              <span>Classes</span>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
              <Folder size={18} />
              <span>Meetings</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <UserButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button className="ml-4 p-2 hover:bg-gray-700 rounded">
            <Settings size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
