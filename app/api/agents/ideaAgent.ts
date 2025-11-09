import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { internetSearchTool } from "./tools/internetSearch";

// Define the output schema using Zod
export const IdeaAnalysisSchema = z.object({
  title: z.string().describe("The title of the identified problem"),
  summary: z.string().describe("A summary of the problem identified and the solution approach from research"),
  solutions: z.array(z.string()).describe("An array of potential solutions for the user"),
});

export type IdeaAnalysis = z.infer<typeof IdeaAnalysisSchema>;

// Define custom state annotation
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  userQuery: Annotation<string>({
    reducer: (prev, next) => next,
    default: () => "",
  }),
  analysis: Annotation<IdeaAnalysis | null>({
    reducer: (prev, next) => next,
    default: () => null,
  }),
});

// Initialize the Google GenAI model
const initializeModel = () => {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.5-flash-lite",
    temperature: 0.7,
  });
};

// Create the agent executor
export const createIdeaAgent = () => {
  const model = initializeModel();
  const tools = [internetSearchTool];

  // Create the react agent with the model and tools
  const agent = createReactAgent({
    llm: model,
    tools,
  });

  return agent;
};

// Main function to analyze user query
export const analyzeIdea = async (userQuery: string): Promise<IdeaAnalysis> => {
  const agent = createIdeaAgent();

  // Create a detailed prompt for the agent
  const systemPrompt = `You are an expert problem analyzer and solution architect.
Your task is to:
1. Understand the user's problem or idea thoroughly
2. Research relevant information using the internet search tool
3. Identify the core problem and any related challenges
4. Generate practical, actionable solutions

Based on your research and analysis, you must provide:
- A clear title that captures the essence of the problem
- A comprehensive summary that explains:
  * What problem you identified from the user's query
  * Key insights from your research
  * The overall solution approach
- A list of 3-5 specific, actionable solutions

User Query: ${userQuery}

Please conduct thorough research and provide a well-structured analysis.`;

  const messages = [new HumanMessage(systemPrompt)];

  // Invoke the agent
  const result = await agent.invoke({
    messages,
  });

  // Extract the final response from the agent
  const finalMessage = result.messages[result.messages.length - 1];
  const responseText = finalMessage.content as string;

  // Parse the response to extract structured data
  // We'll ask the model to structure its response
  const structurePrompt = `Based on the following analysis, extract and format the information as JSON with this exact structure:
{
  "title": "A clear, concise title of the problem",
  "summary": "A comprehensive summary of the problem and solution approach",
  "solutions": ["solution 1", "solution 2", "solution 3", ...]
}

Analysis:
${responseText}

Provide ONLY the JSON output, no additional text.`;

  const model = initializeModel();
  const structuredResult = await model.invoke([new HumanMessage(structurePrompt)]);

  try {
    const jsonMatch = (structuredResult.content as string).match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    const validatedData = IdeaAnalysisSchema.parse(parsedData);

    return validatedData;
  } catch (error) {
    // Fallback if parsing fails
    console.error("Error parsing structured response:", error);

    return {
      title: "Problem Analysis",
      summary: responseText,
      solutions: [
        "Review the detailed analysis above",
        "Consider breaking down the problem into smaller components",
        "Consult with domain experts for specific guidance",
      ],
    };
  }
};
