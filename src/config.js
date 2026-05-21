import dotenv from "dotenv";
dotenv.config();
export const config = {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "AIzaSyC-_ygMpBzJejWzM1lJHbm65Thx2Kl5iJ0",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "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",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "757472273798-p5fvqjk31bo9mucf3dk11f5vs1gee9kc.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback"
};
