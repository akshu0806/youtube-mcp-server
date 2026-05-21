import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTranscript } from "../utils/youtube.js";
import { summarizeTranscript } from "../utils/openai.js";

export function registerSummarizeTool(server: McpServer) {
  server.tool(
    "summarize_video",
    "Get a concise AI-generated summary of a YouTube video using its transcript",
    {
      videoId: z.string().describe("YouTube video ID (e.g. dQw4w9WgXcQ)"),
      title: z
        .string()
        .optional()
        .default("YouTube Video")
        .describe("Title of the video (optional, improves summary quality)"),
    },
    async ({ videoId, title }) => {
      try {
        const transcript = await getTranscript(videoId);

        if (transcript === "Transcript not available for this video.") {
          return {
            content: [
              {
                type: "text",
                text: "Transcript not available for this video. It may be disabled by the creator.",
              },
            ],
            isError: true,
          };
        }

        const summary = await summarizeTranscript(transcript, title);

        return {
          content: [
            {
              type: "text",
              text: `Summary of "${title}":\n\n${summary}\n\nVideo: https://www.youtube.com/watch?v=${videoId}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            { type: "text", text: `Error summarizing video: ${err.message}` },
          ],
          isError: true,
        };
      }
    }
  );
}