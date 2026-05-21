import {google} from "googleapis";
import fs, { stat } from "fs";
import path from "path";
import {config} from "../config.js";

const TOKEN_PATH = path.join(process.cwd(), "token", "oauth_token.json");
export function getOAuthClient() {
    return new google.auth.OAuth2(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET,
        config.GOOGLE_REDIRECT_URI
    );
}
export function getAuthUrl(): string {
    const oAuth2Client = getOAuthClient();
    return oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.force-ssl"],
    });
}
export function saveToken(token: any) {
    fs.mkdirSync(path.dirname(TOKEN_PATH), {recursive: true});
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}
export function loadToken(): any|null {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}
export async function getAuthenticatedYouTube(){
    const oAuth2Client = getOAuthClient();
    const token = loadToken();
    if (!token) {
        throw new Error(`Not authenticated. Please visit this URL to authorize:\n${getAuthUrl()}`);
    }
    oAuth2Client.setCredentials(token);
    oAuth2Client.on("tokens", (newToken) => {
        if (newToken.refresh_token) {
            saveToken({...token, ...newToken});
        }
    });
    return google.youtube({version: "v3", auth: oAuth2Client});
}
export async function createPlaylist(
  title: string,
  description: string,
  videoIds: string[]
): Promise<string> {
  const youtube = await getAuthenticatedYouTube();

  // Step 1: Create the playlist
  const playlistRes = await youtube.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title, description },
      status: { privacyStatus: "public" },
    },
  });

  const playlistId = playlistRes.data.id!;

  // Step 2: Add each video to the playlist
  for (const videoId of videoIds) {
    await youtube.playlistItems.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: { kind: "youtube#video", videoId },
        },
      },
    });
  }

  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

