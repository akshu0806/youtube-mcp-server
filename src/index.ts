import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchTool } from "./tools/search.js";
import { registerSummarizeTool } from "./tools/summarize.js";
import { registerImportantPointsTool } from "./tools/importantPoints.js";
import { registerQuizTool } from "./tools/quiz.js";
import { registerPlaylistTool } from "./tools/playlist.js";

const server = new McpServer({
  name: "youtube-mcp-server",
  version: "1.0.0",
});

// Register all tools
registerSearchTool(server);
registerSummarizeTool(server);
registerImportantPointsTool(server);
registerQuizTool(server);
registerPlaylistTool(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("YouTube MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});