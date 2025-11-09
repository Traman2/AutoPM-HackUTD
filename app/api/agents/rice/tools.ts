import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

// Define the Feature interface for RICE scoring
export interface Feature {
  name: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  rice_score?: number;
}

// RICE Score Calculator
export function calculateRiceScore(feature: Feature): number {
  return (feature.reach * feature.impact * feature.confidence) / feature.effort;
}

export function calculateAndSortFeatures(features: Feature[]): Feature[] {
  // Calculate RICE scores
  const featuresWithScores = features.map(feature => ({
    ...feature,
    rice_score: calculateRiceScore(feature)
  }));

  // Sort by RICE score in descending order
  return featuresWithScores.sort((a, b) => (b.rice_score || 0) - (a.rice_score || 0));
}

// LangGraph workflow for RICE analysis
async function analyzeWithLangGraph(features: Feature[]): Promise<{ sortedFeatures: Feature[], analysis: string }> {
  // Initialize the Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Calculate and sort features
  const sortedFeatures = calculateAndSortFeatures(features);

  // Prepare data for analysis
  const rawTable = sortedFeatures.map(f => ({
    name: f.name,
    reach: f.reach,
    impact: f.impact,
    confidence: f.confidence,
    effort: f.effort,
    rice_score: f.rice_score?.toFixed(2)
  }));

  const prompt = `You are helping a Product Manager explain prioritization to non-technical stakeholders.

Here are features with pre-computed RICE scores (as JSON list):
${JSON.stringify(rawTable, null, 2)}

Please provide a clear, concise analysis:

1) Briefly explain what RICE means in simple language (2-3 sentences max).
2) Explain why the top-ranked item is likely first (consider all four factors).
3) Point out any assumptions or data gaps in the scoring.
4) Suggest 2 specific checks or questions that would increase confidence before committing to this prioritization.

Keep your response professional but accessible to non-technical stakeholders.`;

  const response = await model.invoke([new HumanMessage(prompt)]);
  const analysis = response.content as string;

  return {
    sortedFeatures,
    analysis
  };
}
export async function analyzeRicePrioritization(features: Feature[]): Promise<{
  sortedFeatures: Feature[];
  analysis: string;
}> {
  if (!features || features.length === 0) {
    throw new Error("Features array is required and cannot be empty");
  }
  return analyzeWithLangGraph(features);
}