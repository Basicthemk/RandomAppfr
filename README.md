# NoteFlow - AI-Powered Meeting & Lecture Summarizer

A full-stack web application that records, transcribes, and summarizes meetings and lectures using AI.

## Features

✅ **Browser Audio Recording** - Record directly in the browser with start/pause/resume/stop controls  
✅ **File Upload** - Upload MP3, WAV, M4A, MP4, MOV files (up to 500MB)  
✅ **Auto Transcription** - OpenAI Whisper API for accurate speech-to-text  
✅ **AI Summaries** - Three types:
  - Quick Summary (5-10 bullet points)
  - Detailed Notes (structured markdown)
  - Action Items (task, owner, due date)  
✅ **Context-Aware Chat** - Ask questions about your recordings  
✅ **Dark Mode UI** - Modern, minimal design inspired by Notion and Linear  
✅ **Secure Auth** - Clerk authentication with user isolation  

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI**: OpenAI API (GPT-3.5-turbo, Whisper)

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` with your API keys for Clerk, OpenAI, and PostgreSQL

### 3. Database
```bash
npm run db:push
```

### 4. Run Development
```bash
npm run dev
```

Visit `http://localhost:3000`

## API Endpoints

- `GET /api/recordings` - List recordings
- `POST /api/recordings` - Create recording
- `POST /api/transcriptions` - Transcribe audio
- `POST /api/summaries` - Generate summaries
- `POST /api/chats` - Chat with transcript
- `POST /api/uploads` - Upload audio/video

## License

MIT
