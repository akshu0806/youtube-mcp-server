import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

async function callGroq(prompt: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content || "";
}

// Summarize a transcript
export async function summarizeTranscript(
  transcript: string,
  title: string
): Promise<string> {
  const result = await callGroq(
    `Summarize this YouTube video titled "${title}" in 150-200 words:\n\n${transcript.slice(0, 6000)}`
  );
  return result || "Summary not available.";
}

// Extract important points
export async function extractImportantPoints(
  transcript: string,
  title: string
): Promise<string[]> {
  const result = await callGroq(
    `Extract 5-7 important points from this YouTube video titled "${title}":\n\n${transcript.slice(0, 6000)}\n\nRespond ONLY with a JSON array like ["point 1", "point 2", ...]`
  );
  try {
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return ["Could not extract points. Please try another video."];
  }
}

// Quiz question interface
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// Generate quiz from transcript
export async function generateQuiz(
  transcript: string,
  title: string,
  numQuestions: number = 5
): Promise<QuizQuestion[]> {
  const result = await callGroq(
    `Generate ${numQuestions} multiple choice questions from this video titled "${title}":\n\n${transcript.slice(0, 6000)}\n\nRespond ONLY with a JSON array:\n[{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A) ...","explanation":"..."}]`
  );
  try {
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}