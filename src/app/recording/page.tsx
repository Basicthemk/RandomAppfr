"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Pause,
  Play,
  Upload,
  Download,
  X,
  Check,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function RecordingPage() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to access microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSaveRecording = async () => {
    if (!audioBlob || !title) {
      alert("Please enter a title and ensure you have an audio file");
      return;
    }

    try {
      setUploading(true);

      // Upload file
      const formData = new FormData();
      formData.append("file", audioBlob);

      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const { audioUrl: uploadedUrl } = await uploadRes.json();

      // Create recording
      const recordingRes = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          audioUrl: uploadedUrl,
          duration: recordingTime,
          fileSize: audioBlob.size,
          mimeType: audioBlob.type,
        }),
      });

      if (!recordingRes.ok) {
        throw new Error("Failed to save recording");
      }

      const recording = await recordingRes.json();

      // Trigger transcription
      await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: recording.id }),
      });

      alert("Recording saved! Transcription is processing...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save recording");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">New Recording</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button className="pb-3 px-4 border-b-2 border-blue-600 font-semibold text-gray-900">
            Record
          </button>
          <button className="pb-3 px-4 text-gray-600 hover:text-gray-900">
            Upload
          </button>
        </div>

        {/* Recording Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {!audioBlob ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-blue-100 rounded-full mb-6">
                <Mic className="text-blue-600" size={48} />
              </div>

              {!isRecording ? (
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={startRecording}
                >
                  <Mic size={20} /> Start Recording
                </Button>
              ) : (
                <div className="flex gap-3 justify-center">
                  <div className="text-3xl font-bold text-gray-900 min-w-[120px]">
                    {formatTime(recordingTime)}
                  </div>
                  {isPaused ? (
                    <Button variant="secondary" onClick={resumeRecording}>
                      <Play size={20} /> Resume
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={pauseRecording}>
                      <Pause size={20} /> Pause
                    </Button>
                  )}
                  <Button variant="destructive" onClick={stopRecording}>
                    <Square size={20} /> Stop
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recording Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lecture on AI - Chapter 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Duration: {formatTime(recordingTime)}
                </p>
                {audioUrl && (
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setRecordingTime(0);
                  }}
                >
                  <X size={20} /> Re-record
                </Button>
                <Button
                  onClick={handleSaveRecording}
                  disabled={uploading}
                  className="flex-1 gap-2"
                >
                  <Check size={20} />
                  {uploading ? "Saving..." : "Save Recording"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload size={24} /> Or Upload a File
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <p className="text-gray-600">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported: MP3, WAV, M4A, MP4, MOV (max 500MB)
              </p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
