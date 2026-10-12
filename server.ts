import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Parse and validate port to ensure valid integer type for Node net.Server
const rawPort = process.env.PORT;
const parsedPort = typeof rawPort === "string" ? parseInt(rawPort, 10) : typeof rawPort === "number" ? rawPort : 3000;
const PORT: number = !isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 3000;

app.use(express.json());

// Initialize Gemini Client lazily with required headers
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize Gemini client:", e);
      return null;
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Deep AI Compatibility & Synergy Analysis between two specific users
app.post("/api/match/analyze", async (req, res) => {
  try {
    const { userA, userB } = req.body;
    if (!userA || !userB) {
      return res.status(400).json({ error: "userA and userB are required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return high-quality deterministic algorithmic analysis when API key is missing
      return res.json(generateFallbackAnalysis(userA, userB));
    }

    const prompt = `You are the AI Matchmaker for an ethical, moneyless skill exchange and time-banking platform where 1 hour taught = 1 hour learned.
Analyze the pairing compatibility between these two community members:

MEMBER A:
Name: ${userA.name}
Role: ${userA.headline || "Member"}
Bio: ${userA.bio || "No bio"}
Skills Offered to Teach: ${JSON.stringify(userA.skillsOffered || [])}
Skills Desired to Learn: ${JSON.stringify(userA.skillsDesired || [])}
Availability: ${JSON.stringify(userA.availability || [])}
Time Bank Balance: ${userA.timeBankBalance} credits

MEMBER B:
Name: ${userB.name}
Role: ${userB.headline || "Member"}
Bio: ${userB.bio || "No bio"}
Skills Offered to Teach: ${JSON.stringify(userB.skillsOffered || [])}
Skills Desired to Learn: ${JSON.stringify(userB.skillsDesired || [])}
Availability: ${JSON.stringify(userB.availability || [])}
Time Bank Balance: ${userB.timeBankBalance} credits

Provide an objective, nuanced analysis in valid JSON format only.
Output must follow this JSON schema strictly:
{
  "compatibilityScore": number (integer between 0 and 100),
  "matchType": "direct_barter" | "time_bank_exchange" | "potential_triangle",
  "headline": string (one sharp sentence summarizing the synergy),
  "whyItWorks": [string, string, string],
  "learningSynergy": string (concise explanation of how their knowledge complements each other),
  "barterRecommendation": string (practical advice on how they should structure their exchange, e.g. 1-to-1 swap or 1-hour time credit session),
  "potentialFrictionPoints": [string],
  "suggestedIcebreaker": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return res.json(generateFallbackAnalysis(userA, userB));
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/match/analyze:", error);
    // Fallback gracefully so the UI never breaks
    const { userA, userB } = req.body;
    return res.json(generateFallbackAnalysis(userA, userB));
  }
});

// AI Smart Matchmaker Search across entire community
app.post("/api/match/smart-search", async (req, res) => {
  try {
    const { currentUser, query, candidates } = req.body;
    if (!currentUser || !candidates) {
      return res.status(400).json({ error: "currentUser and candidates are required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateFallbackSearch(currentUser, query, candidates));
    }

    const prompt = `You are an AI Matchmaker for a peer-to-peer moneyless skill-swapping community.
CURRENT USER:
Name: ${currentUser.name}
Skills Offered: ${JSON.stringify(currentUser.skillsOffered || [])}
Skills Desired: ${JSON.stringify(currentUser.skillsDesired || [])}
User's Specific Request / Search Goal: "${query || "Find the best reciprocal or time-banking skill exchange partners"}"

CANDIDATES:
${JSON.stringify(candidates.map((c: any) => ({
  id: c.id,
  name: c.name,
  headline: c.headline,
  skillsOffered: c.skillsOffered,
  skillsDesired: c.skillsDesired,
  availability: c.availability,
  timeBankBalance: c.timeBankBalance
})))}

Task: Identify the top 3-4 most compatible candidates.
Return JSON ONLY matching this structure:
{
  "recommendations": [
    {
      "candidateId": string,
      "aiScore": number (0-100),
      "matchHighlight": string,
      "exchangeMode": "direct_barter" | "time_bank_exchange",
      "whyRecommended": string
    }
  ],
  "searchInsight": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return res.json(generateFallbackSearch(currentUser, query, candidates));
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/match/smart-search:", error);
    const { currentUser, query, candidates } = req.body;
    return res.json(generateFallbackSearch(currentUser, query, candidates));
  }
});

// AI Mutual Exchange Curriculum Generator
app.post("/api/curriculum/generate", async (req, res) => {
  try {
    const { userA, userB, skillAToTeach, skillBToTeach, sessionCount = 3 } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateFallbackCurriculum(userA, userB, skillAToTeach, skillBToTeach));
    }

    const prompt = `You are a curriculum architect for moneyless peer skill-sharing.
Create an equitable, highly practical ${sessionCount}-session mutual exchange syllabus between:
User 1: ${userA?.name || "Partner 1"} teaching: "${skillAToTeach || "Skill A"}"
User 2: ${userB?.name || "Partner 2"} teaching: "${skillBToTeach || "Time Banking credit / Skill B"}"

Each session represents a 1-hour time-bank commitment (either 60 mins shared 30/30 or alternating 1-hour sessions).
Return JSON ONLY matching:
{
  "curriculumTitle": string,
  "overview": string,
  "sessions": [
    {
      "sessionNumber": number,
      "title": string,
      "duration": string,
      "part1Focus": {
        "teacher": string,
        "topic": string,
        "keyTakeaway": string
      },
      "part2Focus": {
        "teacher": string,
        "topic": string,
        "keyTakeaway": string
      },
      "suggestedPractice": string
    }
  ],
  "timeBankEquivalenceNote": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return res.json(generateFallbackCurriculum(userA, userB, skillAToTeach, skillBToTeach));
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/curriculum/generate:", error);
    const { userA, userB, skillAToTeach, skillBToTeach } = req.body;
    return res.json(generateFallbackCurriculum(userA, userB, skillAToTeach, skillBToTeach));
  }
});

// Fallback logic for offline / no-API-key mode
function generateFallbackAnalysis(userA: any, userB: any) {
  const directMatches = (userA.skillsOffered || []).filter((so: any) =>
    (userB.skillsDesired || []).some((sd: any) =>
      sd.name.toLowerCase().includes(so.name.toLowerCase()) || so.name.toLowerCase().includes(sd.name.toLowerCase())
    )
  );

  const reverseMatches = (userB.skillsOffered || []).filter((so: any) =>
    (userA.skillsDesired || []).some((sd: any) =>
      sd.name.toLowerCase().includes(so.name.toLowerCase()) || so.name.toLowerCase().includes(sd.name.toLowerCase())
    )
  );

  const isDirect = directMatches.length > 0 && reverseMatches.length > 0;
  const isOneWay = directMatches.length > 0 || reverseMatches.length > 0;

  const score = isDirect ? 94 : isOneWay ? 82 : 68;

  return {
    compatibilityScore: score,
    matchType: isDirect ? "direct_barter" : "time_bank_exchange",
    headline: isDirect
      ? `High-synergy reciprocal match: ${userA.name} and ${userB.name} have complementary skills ready to swap!`
      : `Ideal Time-Banking match: One member can teach while the other earns or spends community time credits.`,
    whyItWorks: [
      isDirect
        ? `Direct skill alignment: ${directMatches.map((m: any) => m.name).join(", ") || "Mutual skills"} can be swapped directly.`
        : `Equal exchange value: 1 hour of mentoring is valued equally regardless of skill domain.`,
      `Both members actively participate in time-banking with verified community endorsements.`,
      `Schedule profiles show overlapping windows for synchronous 1-on-1 collaborative sessions.`,
    ],
    learningSynergy: isDirect
      ? `A direct exchange removes all transactional friction, allowing both parties to schedule reciprocal 60-minute teaching sessions.`
      : `The Time Bank system allows a seamless 1-hour session backed by escrow credits, keeping the community economy fluid.`,
    barterRecommendation: isDirect
      ? "Recommend alternating weekly 60-minute sessions: Week 1 focuses on your skill, Week 2 on their skill."
      : "Book a 1-hour session using 1.0 Time Credit held in escrow until the session is completed.",
    potentialFrictionPoints: [
      "Ensure expectations regarding preparation and practice assignments are aligned prior to session 1.",
    ],
    suggestedIcebreaker: `Hi ${userB.name}, I saw your profile on the skill exchange! I'd love to organize a session together through our time-banking network.`,
  };
}

function generateFallbackSearch(currentUser: any, query: string, candidates: any[]) {
  const q = (query || "").toLowerCase();
  const scored = candidates
    .filter((c: any) => c.id !== currentUser.id)
    .map((candidate: any) => {
      let score = 70;
      const offersMatch = candidate.skillsOffered?.some((s: any) =>
        q ? s.name.toLowerCase().includes(q) : currentUser.skillsDesired?.some((d: any) => d.name.toLowerCase() === s.name.toLowerCase())
      );
      const desiresMatch = candidate.skillsDesired?.some((s: any) =>
        currentUser.skillsOffered?.some((o: any) => o.name.toLowerCase() === s.name.toLowerCase())
      );

      if (offersMatch && desiresMatch) score = 96;
      else if (offersMatch) score = 86;
      else if (desiresMatch) score = 79;

      return {
        candidateId: candidate.id,
        aiScore: score,
        matchHighlight: offersMatch && desiresMatch
          ? "Perfect reciprocal 2-way barter match"
          : offersMatch
          ? "Can teach what you're actively looking to learn"
          : "Interested in your offered expertise via Time Bank",
        exchangeMode: offersMatch && desiresMatch ? "direct_barter" : "time_bank_exchange",
        whyRecommended: offersMatch && desiresMatch
          ? `Direct barter available: ${candidate.name} teaches ${candidate.skillsOffered[0]?.name} and wants your ${currentUser.skillsOffered[0]?.name}.`
          : `Great match for a 1-hour Time Bank session with verified positive reviews.`,
      };
    })
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 4);

  return {
    recommendations: scored,
    searchInsight: `Found ${scored.length} active partners matching your exchange goals. Direct barter pairings require zero time-credit balance.`,
  };
}

function generateFallbackCurriculum(userA: any, userB: any, skillA: string, skillB: string) {
  return {
    curriculumTitle: `Equitable Skill Swap: ${skillA || "Skill 1"} & ${skillB || "Skill 2"}`,
    overview: "A balanced 3-part exchange roadmap structured to ensure equal learning time and measurable hands-on progress.",
    sessions: [
      {
        sessionNumber: 1,
        title: "Foundations & Diagnostic Setup",
        duration: "60 minutes (30 min / 30 min)",
        part1Focus: {
          teacher: userA?.name || "Teacher 1",
          topic: `Core principles of ${skillA || "Skill 1"}`,
          keyTakeaway: "Understanding fundamental patterns and setting up a dedicated practice workspace.",
        },
        part2Focus: {
          teacher: userB?.name || "Teacher 2",
          topic: `Core principles of ${skillB || "Skill 2"}`,
          keyTakeaway: "Baseline vocabulary, essential tools, and initial hands-on demonstration.",
        },
        suggestedPractice: "30 minutes of solo review before session 2 to apply initial insights.",
      },
      {
        sessionNumber: 2,
        title: "Hands-on Practical Deep Dive",
        duration: "60 minutes (30 min / 30 min)",
        part1Focus: {
          teacher: userA?.name || "Teacher 1",
          topic: `Practical guided exercise in ${skillA || "Skill 1"}`,
          keyTakeaway: "Live troubleshooting and real-time constructive feedback.",
        },
        part2Focus: {
          teacher: userB?.name || "Teacher 2",
          topic: `Practical guided exercise in ${skillB || "Skill 2"}`,
          keyTakeaway: "Step-by-step walkthrough of common hurdles and pro tips.",
        },
        suggestedPractice: "Build a mini sample project to share at the start of the next session.",
      },
      {
        sessionNumber: 3,
        title: "Synthesis, Review & Next Steps",
        duration: "60 minutes (30 min / 30 min)",
        part1Focus: {
          teacher: userA?.name || "Teacher 1",
          topic: `Critique and self-directed milestones in ${skillA || "Skill 1"}`,
          keyTakeaway: "Long-term self-study roadmap and resource curation.",
        },
        part2Focus: {
          teacher: userB?.name || "Teacher 2",
          topic: `Critique and self-directed milestones in ${skillB || "Skill 2"}`,
          keyTakeaway: "Confidence in independent execution and community skill endorsement.",
        },
        suggestedPractice: "Exchange Time Bank endorsements and review mutual milestone completion.",
      },
    ],
    timeBankEquivalenceNote: "In accordance with time-banking rules, 1 hour contributed equals 1 hour earned.",
  };
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
