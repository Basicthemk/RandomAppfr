export type RecordingStatus = "pending" | "processing" | "completed" | "failed";

export interface IRecording {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  fileSize?: number;
  transcript?: string;
  transcriptionStatus: RecordingStatus;
  quickSummary?: string;
  detailedNotes?: string;
  summaryStatus: RecordingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActionItem {
  id: string;
  task: string;
  owner?: string;
  dueDate?: Date;
  recordingId: string;
}

export interface IChat {
  id: string;
  question: string;
  answer: string;
  userId: string;
  recordingId: string;
  createdAt: Date;
}
