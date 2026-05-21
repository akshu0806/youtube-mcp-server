import { z } from "zod";
import { searchYouTube } from "../utils/youtube";
export function registerSearchTool(server) {
    server.tool("search_videos", "Search YouTube videos by query and return ranked results with engagement scores", {
        query: z.string().describe("Search query for YouTube videos"),
        maxResults: z
            .number()
            .min(1)
            .max(10)
            .default(5)
            .describe("Number of results to return (1-10)"),
    }, async ({ query, maxResults }) => {
        try {
            const videos = await searchYouTube(query, maxResults);
            const ranked = videos.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
            const formatted = ranked.map((v, i) => `#${i + 1} ${v.title}\n` +
                `Channel: ${v.channelTitle}\n` +
                `Views: ${Number(v.viewCount).toLocaleString()} | Likes: ${Number(v.likeCount).toLocaleString()}\n` +
                `Engagement Score: ${v.engagementScore}%\n` +
                `URL: ${v.url}\n` +
                `Video ID: ${v.videoId}\n`).join("\n\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Found ${ranked.length} videos for "${query}" (ranked by engagement):\n\n${formatted}`,
                    },
                ],
            };
        }
        catch (err) {
            return {
                content: [
                    { type: "text", text: `Error searching videos: ${err.message}` },
                ],
                isError: true,
            };
        }
    });
}
