import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResponse {
  text: string;
  duration?: number;
}

export interface SummaryResponse {
  quickSummary: string;
  detailedNotes: string;
  actionItems: Array<{
    task: string;
    owner?: string;
    dueDate?: string;
  }>;
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResponse> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
      model: "whisper-1",
      language: "en",
    });

    return {
      text: response.text,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function generateSummaries(transcript: string): Promise<SummaryResponse> {
  try {
    const [quickRes, detailedRes, actionsRes] = await Promise.all([
      generateQuickSummary(transcript),
      generateDetailedNotes(transcript),
      extractActionItems(transcript),
    ]);

    return {
      quickSummary: quickRes,
      detailedNotes: detailedRes,
      actionItems: actionsRes,
    };
  } catch (error) {
    console.error("Summary generation error:", error);
    throw new Error("Failed to generate summaries");
  }
}

async function generateQuickSummary(transcript: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates concise bullet-point summaries. Return exactly 5-10 bullet points, each starting with •",
      },
      {
        role: "user",
        content: `Create a quick summary (5-10 bullet points) of this transcript:\n\n${transcript}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "";
}

async function generateDetailedNotes(transcript: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates structured detailed notes in markdown format. Use headers, subheaders, and organized sections.",
      },
      {
        role: "user",
        content: `Create detailed structured notes in markdown format from this transcript:\n\n${transcript}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}

async function extractActionItems(transcript: string): Promise<Array<{ task: string; owner?: string; dueDate?: string }>> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: 'You are a helpful assistant that extracts action items from transcripts. Return a JSON array of objects with "task", "owner" (or null), and "dueDate" (or null) fields.',
      },
      {
        role: "user",
        content: `Extract action items from this transcript and return as JSON array:\n\n${transcript}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  try {
    const content = response.choices[0]?.message?.content || "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Failed to parse action items:", error);
    return [];
  }
}

export async function chatWithTranscript(question: string, transcript: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions based solely on the provided transcript. If the answer is not in the transcript, say "I couldn't find this information in the transcript."`,
        },
        {
          role: "user",
          content: `Transcript:\n${transcript}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Failed to process chat request");
  }
}
