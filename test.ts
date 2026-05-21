import { searchYouTube } from "./src/utils/youtube.js";
import { getTranscript } from "./src/utils/youtube.js";
import { summarizeTranscript } from "./src/utils/openai.js";
import { extractImportantPoints } from "./src/utils/openai.js";
import { generateQuiz } from "./src/utils/openai.js";

async function test() {
  console.log("🔍 Testing Search...");
  const videos = await searchYouTube("javascript tutorial", 3);
  console.log(`Found ${videos.length} videos`);
  console.log(`Top video: ${videos[0].title}`);
  console.log(`Video ID: ${videos[0].videoId}`);
  console.log(`Engagement Score: ${videos[0].engagementScore}%\n`);

  const videoId = videos[0].videoId;
  const title = videos[0].title;

  console.log("📝 Getting transcript...");
  const transcript = await getTranscript(videoId);
  console.log(`Transcript length: ${transcript.length} characters\n`);

  console.log("📄 Testing Summarize...");
  const summary = await summarizeTranscript(transcript, title);
  console.log(`Summary: ${summary}\n`);

  console.log("💡 Testing Important Points...");
  const points = await extractImportantPoints(transcript, title);
  points.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  console.log("");

  console.log("🧠 Testing Quiz Generation...");
  const quiz = await generateQuiz(transcript, title, 2);
  quiz.forEach((q, i) => {
    console.log(`Q${i + 1}: ${q.question}`);
    q.options.forEach((o) => console.log(`   ${o}`));
    console.log(`   ✅ Answer: ${q.answer}\n`);
  });
}

test().catch(console.error);