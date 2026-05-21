import axios from "axios";
import { config } from "../config.js";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";
// Search YouTube videos
export async function searchYouTube(query, maxResults = 5) {
    const searchRes = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
        params: {
            key: config.YOUTUBE_API_KEY,
            q: query,
            part: "snippet",
            type: "video",
            maxResults,
        },
    });
    const items = searchRes.data.items;
    const videoIds = items.map((i) => i.id.videoId).join(",");
    // Fetch video stats for engagement score
    const statsRes = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
        params: {
            key: config.YOUTUBE_API_KEY,
            id: videoIds,
            part: "statistics,contentDetails",
        },
    });
    const statsMap = {};
    for (const v of statsRes.data.items) {
        statsMap[v.id] = v;
    }
    return items.map((item) => {
        const videoId = item.id.videoId;
        const stats = statsMap[videoId]?.statistics || {};
        const duration = statsMap[videoId]?.contentDetails?.duration || "";
        const views = parseInt(stats.viewCount || "0");
        const likes = parseInt(stats.likeCount || "0");
        const comments = parseInt(stats.commentCount || "0");
        // Engagement score: (likes + comments) / views * 100
        const engagementScore = views > 0
            ? parseFloat((((likes + comments) / views) * 100).toFixed(2))
            : 0;
        return {
            videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails?.medium?.url || "",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            viewCount: stats.viewCount || "0",
            likeCount: stats.likeCount || "0",
            duration,
            engagementScore,
        };
    });
}
// Fetch transcript for a video
export async function getTranscript(videoId) {
    try {
        const res = await axios.get(`https://www.youtube-transcript-api.com/api/transcript`, { params: { video_id: videoId } });
        if (Array.isArray(res.data)) {
            return res.data.map((seg) => seg.text).join(" ");
        }
        return res.data?.transcript || "Transcript not available.";
    }
    catch {
        return "Transcript not available for this video.";
    }
}
