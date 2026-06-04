"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">NoteFlow</h1>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Lectures Into Notes
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Record, transcribe, and summarize meetings and lectures with AI-powered insights
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Recording <ArrowRight size={20} />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <Zap className="text-blue-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Quick Recording</h3>
            <p className="text-gray-600">Record audio directly in your browser or upload existing files</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md">
            <Brain className="text-purple-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">AI Summaries</h3>
            <p className="text-gray-600">Get quick summaries, detailed notes, and action items</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md">
            <FileText className="text-indigo-600 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Easy Export</h3>
            <p className="text-gray-600">Export as PDF, DOCX, Markdown, or plain text</p>
          </div>
        </div>
      </div>
    </div>
  );
}
