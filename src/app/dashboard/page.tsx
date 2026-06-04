"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2, MoreVertical } from "lucide-react";
import { formatBytes, formatTime } from "@/lib/utils";

interface Recording {
  id: string;
  title: string;
  duration?: number;
  fileSize?: number;
  createdAt: string;
  transcriptionStatus: string;
  summaryStatus: string;
}

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recordings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch recordings");
      }

      const data = await response.json();
      setRecordings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Total Recordings</p>
          <p className="text-3xl font-bold">{recordings.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Recent Recordings</p>
          <p className="text-3xl font-bold">{recordings.slice(0, 7).length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Total Storage Used</p>
          <p className="text-3xl font-bold">
            {formatBytes(
              recordings.reduce((sum, r) => sum + (r.fileSize || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Recent Recordings */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Recordings</h2>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : recordings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">No recordings yet</p>
            <Link href="/recording">
              <Button>Create Your First Recording</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-gray-800 hover:bg-gray-750 rounded-lg p-4 flex items-center justify-between transition"
              >
                <div className="flex-1">
                  <Link href={`/viewer/${recording.id}`}>
                    <h3 className="font-semibold hover:text-blue-400 cursor-pointer">
                      {recording.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-400">
                    {recording.duration && `${formatTime(recording.duration)} • `}
                    {new Date(recording.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded">
                      {recording.transcriptionStatus}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded">
                      {recording.summaryStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/viewer/${recording.id}`}>
                    <Button size="sm" variant="ghost">
                      <Play size={18} />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost">
                    <Download size={18} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
