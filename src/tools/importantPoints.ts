import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTranscript } from "../utils/youtube.js";
import { extractImportantPoints } from "../utils/openai.js";

export function registerImportantPointsTool(server: McpServer) {
  server.tool(
    "get_important_points",
    "Extract key takeaways and important points from a YouTube video",
    {
      videoId: z.string().describe("YouTube video ID (e.g. dQw4w9WgXcQ)"),
      title: z
        .string()
        .optional()
        .default("YouTube Video")
        .describe("Title of the video (optional)"),
    },
    async ({ videoId, title }) => {
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

        const points = await extractImportantPoints(transcript, title);

        const formatted = points
          .map((point, i) => `${i + 1}. ${point}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Key Takeaways from "${title}":\n\n${formatted}\n\nVideo: https://www.youtube.com/watch?v=${videoId}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error extracting points: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}