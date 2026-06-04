"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Download,
  ArrowLeft,
  MessageCircle,
  Loader,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Recording {
  id: string;
  title: string;
  description?: string;
  transcript?: string;
  quickSummary?: string;
  detailedNotes?: string;
  transcriptionStatus: string;
  summaryStatus: string;
  duration?: number;
  audioUrl?: string;
  actionItems: Array<{
    id: string;
    task: string;
    owner?: string;
    dueDate?: string;
  }>;
}

export default function ViewerPage() {
  const params = useParams();
  const recordingId = params.id as string;
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchRecording();
  }, [recordingId]);

  const fetchRecording = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recordings/${recordingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recording");
      }

      const data = await response.json();
      setRecording(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuestion.trim() || !recording) return;

    try {
      setChatLoading(true);
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingId,
          question: chatQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setChatAnswer(data.answer);
      setChatQuestion("");
    } catch (err) {
      alert("Failed to process question");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Recording not found"}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2">
              <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-3xl font-bold">{recording.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download size={20} /> Export
            </Button>
            <Button
              onClick={() => setChatOpen(!chatOpen)}
              variant="outline"
            >
              <MessageCircle size={20} /> Chat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Transcript */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audio Player */}
            {recording.audioUrl && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Audio</h2>
                <audio
                  src={recording.audioUrl}
                  controls
                  className="w-full"
                />
              </div>
            )}

            {/* Transcript */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Transcript</h2>
                <span className="text-xs px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded">
                  {recording.transcriptionStatus}
                </span>
              </div>

              {recording.transcriptionStatus === "completed" && recording.transcript ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {recording.transcript}
                </p>
              ) : recording.transcriptionStatus === "processing" ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader className="animate-spin" size={20} />
                  Transcribing...
                </div>
              ) : (
                <p className="text-gray-400">No transcript available</p>
              )}
            </div>
          </div>

          {/* Right: Summaries & Chat */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Summary</h3>
                <span className="text-xs px-2 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded">
                  {recording.summaryStatus}
                </span>
              </div>

              {recording.summaryStatus === "completed" && recording.quickSummary ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {recording.quickSummary}
                </p>
              ) : recording.summaryStatus === "processing" ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader className="animate-spin" size={20} />
                  Generating...
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Awaiting transcription...</p>
              )}
            </div>

            {/* Action Items */}
            {recording.actionItems && recording.actionItems.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Action Items</h3>
                <div className="space-y-3">
                  {recording.actionItems.map((item) => (
                    <div key={item.id} className="bg-gray-700 p-3 rounded">
                      <p className="font-medium text-white">{item.task}</p>
                      {item.owner && (
                        <p className="text-xs text-gray-400 mt-1">
                          Owner: {item.owner}
                        </p>
                      )}
                      {item.dueDate && (
                        <p className="text-xs text-gray-400">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            {chatOpen && recording.transcript && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Ask About This Recording</h3>
                <div className="space-y-4">
                  <textarea
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ask something about the recording..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    onClick={handleChat}
                    disabled={chatLoading || !chatQuestion.trim()}
                    className="w-full"
                  >
                    {chatLoading ? "Thinking..." : "Ask"}
                  </Button>

                  {chatAnswer && (
                    <div className="bg-gray-700 rounded p-4 text-sm">
                      <p className="text-gray-300">{chatAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
