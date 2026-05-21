import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createPlaylist,
  getAuthUrl,
  saveToken,
  getOAuthClient,
} from "../utils/oauth.js";

export function registerPlaylistTool(server: McpServer) {
  // Tool 1: Get the OAuth authorization URL
  server.tool(
    "get_auth_url",
    "Get the Google OAuth authorization URL. User must visit this URL to grant YouTube access before creating playlists.",
    {},
    async () => {
      const url = getAuthUrl();
      return {
        content: [
          {
            type: "text",
            text:
              `Please visit this URL to authorize YouTube access:\n\n${url}\n\n` +
              `After authorization, you'll get a code. Use the 'save_auth_code' tool with that code.`,
          },
        ],
      };
    }
  );

  // Tool 2: Save the OAuth code after user authorizes
  server.tool(
    "save_auth_code",
    "Save the OAuth authorization code received after visiting the auth URL",
    {
      code: z
        .string()
        .describe("The authorization code from the OAuth redirect URL"),
    },
    async ({ code }) => {
      try {
        const oauth2Client = getOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        saveToken(tokens);
        return {
          content: [
            {
              type: "text",
              text: "Authorization successful! You can now create YouTube playlists.",
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Authorization failed: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 3: Create a playlist
  server.tool(
    "create_playlist",
    "Create a YouTube playlist and add videos to it (requires prior OAuth authorization)",
    {
      title: z.string().describe("Title of the playlist"),
      description: z
        .string()
        .optional()
        .default("")
        .describe("Description for the playlist"),
      videoIds: z
        .array(z.string())
        .min(1)
        .describe("Array of YouTube video IDs to add to the playlist"),
    },
    async ({ title, description, videoIds }) => {
      try {
        const playlistUrl = await createPlaylist(title, description, videoIds);
        return {
          content: [
            {
              type: "text",
              text:
                `Playlist "${title}" created successfully!\n\n` +
                `Added ${videoIds.length} video(s).\n` +
                `Playlist URL: ${playlistUrl}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating playlist: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}