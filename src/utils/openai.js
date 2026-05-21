import OpenAi from "openai";
import { config } from "../config";
const openai = new OpenAi({
    apiKey: config.OPENAI_API_KEY,
});
export async function summarizeTranscript(transcript, title) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an expert at summarizing YouTube video transcripts concisely and clearly. ",
            },
            {
                role: "user",
                content: `Summarize this YouTube video titled "${title}" in 150-200 words:\n\n${transcript}.split(0,6000)}`,
            },
        ],
    });
    return res.choices[0].message.content || "Summary not available.";
}
export async function extractImportantPoints(transcript, title) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an expert at extracting key points from video transcripts. Return a JSON array of strings only.",
            },
            {
                role: "user",
                content: `Extract 5-7 important points from this YouTube video titled "${title}":\n\n${transcript.slice(0, 6000)}\n\nRespond ONLY with a JSON array of like ["Point 1", "Point 2", ...]`,
            },
        ],
    });
    try {
        const text = res.choices[0].message.content || "[]";
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    }
    catch {
        return ["Could not extract points. Please try another video."];
    }
}
export async function generateQuiz(transcript, title, numQuestions = 5) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an expert quiz maker. Generate MCQs from video transcripts. Return valid JSON only.",
            },
            {
                role: "user",
                content: `Generate ${numQuestions} multiple choice questions from this video titled "${title}":\n\n${transcript.slice(0, 6000)}\n\nRespond ONLY with a JSON array:\n[{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A) ...","explanation":"..."}]`,
            },
        ],
    });
    try {
        const text = res.choices[0].message.content || "[]";
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    }
    catch {
        return [];
    }
}
