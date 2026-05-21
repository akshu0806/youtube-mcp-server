import { z } from "zod";
import { getTranscript } from "../utils/youtube.js";
import { generateQuiz } from "../utils/openai.js";
export function registerQuizTool(server) {
    server.tool("generate_quiz", "Generate multiple choice quiz questions from a YouTube video transcript", {
        videoId: z.string().describe("YouTube video ID"),
        title: z
            .string()
            .optional()
            .default("YouTube Video")
            .describe("Title of the video"),
        numQuestions: z
            .number()
            .min(1)
            .max(10)
            .default(5)
            .describe("Number of quiz questions to generate"),
    }, async ({ videoId, title, numQuestions }) => {
        try {
            const transcript = await getTranscript(videoId);
            if (transcript === "Transcript not available for this video.") {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Transcript not available for this video.",
                        },
                    ],
                    isError: true,
                };
            }
            const questions = await generateQuiz(transcript, title, numQuestions);
            if (questions.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Could not generate quiz. Try a different video.",
                        },
                    ],
                    isError: true,
                };
            }
            const formatted = questions
                .map((q, i) => `Q${i + 1}: ${q.question}\n` +
                q.options.map((o) => `   ${o}`).join("\n") +
                `\n✅ Answer: ${q.answer}` +
                `\n💡 Explanation: ${q.explanation}`)
                .join("\n\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Quiz for "${title}" (${questions.length} questions):\n\n${formatted}`,
                    },
                ],
            };
        }
        catch (err) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error generating quiz: ${err.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
