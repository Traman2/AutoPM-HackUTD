import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { z } from "zod";

// Interface for the chatbot response
export interface ChatbotResponse {
  answer: string;
  context: string[];
  confidence: "high" | "medium" | "low";
}

// Space context interface
export interface SpaceContext {
  spaceName: string;
  description: string;
  currentStep: number;
  completed: boolean;

  // Agent results
  ideaAgent?: {
    title?: string;
    summary?: string;
    solutions?: any[];
    selectedSolution?: string;
  };

  storyAgent?: {
    userStories?: any[];
    summary?: string;
  };

  emailAgent?: {
    results?: any[];
    summary?: string;
  };

  riceAgent?: {
    scores?: any[];
    summary?: string;
  };

  okrAgent?: {
    objectives?: any[];
    summary?: string;
  };

  wireframeAgent?: {
    pages?: any[];
    summary?: string;
  };

  jiraAgent?: {
    projectKey?: string;
    projectName?: string;
    tickets?: any[];
    summary?: string;
  };
}

// Schema for AI response
const AnswerSchema = z.object({
  answer: z.string().describe("Comprehensive answer to the user's question based on the context"),
  relevantContext: z.array(z.string()).describe("Key pieces of context that were used to answer the question"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level of the answer based on available context"),
});

// State annotation for LangGraph
const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  spaceContext: Annotation<SpaceContext>,
  contextSummary: Annotation<string>,
  answer: Annotation<string>,
  relevantContext: Annotation<string[]>,
  confidence: Annotation<"high" | "medium" | "low">,
  output: Annotation<ChatbotResponse | null>,
});

// Node 1: Build context summary from all agent results
async function buildContextSummary(state: typeof StateAnnotation.State) {
  console.log("[Chatbot] Building context summary from space data");

  const { spaceContext } = state;
  const contextParts: string[] = [];

  // Add space basic info
  contextParts.push(`Space Name: ${spaceContext.spaceName}`);
  contextParts.push(`Description: ${spaceContext.description}`);
  contextParts.push(`Current Step: ${spaceContext.currentStep}/7`);
  contextParts.push(`Completed: ${spaceContext.completed ? 'Yes' : 'No'}`);

  // Add Idea Agent context
  if (spaceContext.ideaAgent) {
    contextParts.push("\n--- IDEA AGENT (Step 1) ---");
    if (spaceContext.ideaAgent.title) {
      contextParts.push(`Title: ${spaceContext.ideaAgent.title}`);
    }
    if (spaceContext.ideaAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.ideaAgent.summary}`);
    }
    if (spaceContext.ideaAgent.selectedSolution) {
      contextParts.push(`Selected Solution: ${spaceContext.ideaAgent.selectedSolution}`);
    }
    if (spaceContext.ideaAgent.solutions && spaceContext.ideaAgent.solutions.length > 0) {
      contextParts.push(`All Solutions (${spaceContext.ideaAgent.solutions.length}):`);
      spaceContext.ideaAgent.solutions.forEach((sol: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. ${sol.title}: ${sol.description}`);
      });
    }
  }

  // Add Story Agent context
  if (spaceContext.storyAgent) {
    contextParts.push("\n--- USER STORIES AGENT (Step 2) ---");
    if (spaceContext.storyAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.storyAgent.summary}`);
    }
    if (spaceContext.storyAgent.userStories && spaceContext.storyAgent.userStories.length > 0) {
      contextParts.push(`User Stories (${spaceContext.storyAgent.userStories.length}):`);
      spaceContext.storyAgent.userStories.forEach((story: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. As a ${story.persona}, I want to ${story.action} so that ${story.benefit}`);
        if (story.acceptanceCriteria) {
          contextParts.push(`     Acceptance: ${story.acceptanceCriteria}`);
        }
      });
    }
  }

  // Add Email Agent context
  if (spaceContext.emailAgent) {
    contextParts.push("\n--- EMAIL AGENT (Step 3) ---");
    if (spaceContext.emailAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.emailAgent.summary}`);
    }
    if (spaceContext.emailAgent.results && spaceContext.emailAgent.results.length > 0) {
      contextParts.push(`Team Members (${spaceContext.emailAgent.results.length}):`);
      spaceContext.emailAgent.results.forEach((result: any, idx: number) => {
        if (result.success) {
          contextParts.push(`  ${idx + 1}. ${result.name} (${result.email}) - ${result.role}`);
        }
      });
    }
  }

  // Add RICE Agent context
  if (spaceContext.riceAgent) {
    contextParts.push("\n--- RICE SCORING AGENT (Step 4) ---");
    if (spaceContext.riceAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.riceAgent.summary}`);
    }
    if (spaceContext.riceAgent.scores && spaceContext.riceAgent.scores.length > 0) {
      contextParts.push(`RICE Scores:`);
      spaceContext.riceAgent.scores.forEach((score: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. ${score.feature}: RICE Score = ${score.riceScore}`);
        contextParts.push(`     Reach: ${score.reach}, Impact: ${score.impact}, Confidence: ${score.confidence}, Effort: ${score.effort}`);
      });
    }
  }

  // Add OKR Agent context
  if (spaceContext.okrAgent) {
    contextParts.push("\n--- OKR AGENT (Step 5) ---");
    if (spaceContext.okrAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.okrAgent.summary}`);
    }
    if (spaceContext.okrAgent.objectives && spaceContext.okrAgent.objectives.length > 0) {
      contextParts.push(`Objectives (${spaceContext.okrAgent.objectives.length}):`);
      spaceContext.okrAgent.objectives.forEach((obj: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. ${obj.objective}`);
        if (obj.keyResults && obj.keyResults.length > 0) {
          contextParts.push(`     Key Results:`);
          obj.keyResults.forEach((kr: any, krIdx: number) => {
            contextParts.push(`       - ${kr}`);
          });
        }
      });
    }
  }

  // Add Wireframe Agent context
  if (spaceContext.wireframeAgent) {
    contextParts.push("\n--- WIREFRAME AGENT (Step 6) ---");
    if (spaceContext.wireframeAgent.pages && spaceContext.wireframeAgent.pages.length > 0) {
      contextParts.push(`Wireframe Pages (${spaceContext.wireframeAgent.pages.length}):`);
      spaceContext.wireframeAgent.pages.forEach((page: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. ${page.name}: ${page.description}`);
      });
    }
  }

  // Add Jira Agent context
  if (spaceContext.jiraAgent) {
    contextParts.push("\n--- JIRA AGENT (Step 7) ---");
    if (spaceContext.jiraAgent.projectName) {
      contextParts.push(`Jira Project: ${spaceContext.jiraAgent.projectName} (${spaceContext.jiraAgent.projectKey})`);
    }
    if (spaceContext.jiraAgent.summary) {
      contextParts.push(`Summary: ${spaceContext.jiraAgent.summary}`);
    }
    if (spaceContext.jiraAgent.tickets && spaceContext.jiraAgent.tickets.length > 0) {
      contextParts.push(`Jira Tickets (${spaceContext.jiraAgent.tickets.length}):`);
      spaceContext.jiraAgent.tickets.forEach((ticket: any, idx: number) => {
        contextParts.push(`  ${idx + 1}. ${ticket.key}: ${ticket.summary}`);
        contextParts.push(`     ${ticket.description}`);
      });
    }
  }

  const contextSummary = contextParts.join('\n');
  console.log(`[Chatbot] Built context summary (${contextSummary.length} chars)`);

  return { contextSummary };
}

// Node 2: Generate answer using AI
async function generateAnswer(state: typeof StateAnnotation.State) {
  console.log(`[Chatbot] Generating answer for question: "${state.question}"`);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredOutputModel = model.withStructuredOutput(AnswerSchema);

  const result = await structuredOutputModel.invoke([
    {
      role: "system",
      content: `You are an intelligent assistant that helps users understand their product development space. You have access to all the data from the 7-step product development workflow including:

1. Idea generation and solution selection
2. User stories
3. Team member assignments
4. RICE prioritization scores
5. OKRs (Objectives and Key Results)
6. Wireframe designs
7. Jira ticket creation

Your job is to:
- Answer questions accurately based on the provided context
- Provide specific details and examples from the context
- Be concise but comprehensive
- Indicate confidence level based on how well the context supports your answer
- If information is not in the context, say so clearly

Context quality levels:
- HIGH: Question directly addressed in context with specific details
- MEDIUM: Can infer answer from context but not explicitly stated
- LOW: Limited or no relevant information in context`,
    },
    {
      role: "user",
      content: `Context from the product development space:

${state.contextSummary}

---

User Question: ${state.question}

Please provide a comprehensive answer based on the context above. Extract relevant details and provide specific examples where possible.`,
    },
  ]);

  console.log(`[Chatbot] Answer generated with ${result.confidence} confidence`);
  console.log(`[Chatbot] Used ${result.relevantContext.length} context pieces`);

  return {
    answer: result.answer,
    relevantContext: result.relevantContext,
    confidence: result.confidence,
  };
}

// Node 3: Create final output
async function createOutput(state: typeof StateAnnotation.State) {
  console.log("[Chatbot] Creating final output");

  const output: ChatbotResponse = {
    answer: state.answer,
    context: state.relevantContext,
    confidence: state.confidence,
  };

  return { output };
}

// Main chatbot workflow
export async function runChatbot(
  question: string,
  spaceContext: SpaceContext
): Promise<ChatbotResponse> {
  console.log(`[Chatbot] Starting workflow for question: "${question}"`);

  // Create LangGraph workflow
  const workflow = new StateGraph(StateAnnotation)
    .addNode("buildContextSummary", buildContextSummary)
    .addNode("generateAnswer", generateAnswer)
    .addNode("createOutput", createOutput)
    .addEdge("__start__", "buildContextSummary")
    .addEdge("buildContextSummary", "generateAnswer")
    .addEdge("generateAnswer", "createOutput")
    .addEdge("createOutput", "__end__")
    .compile();

  // Execute workflow
  const result = await workflow.invoke({
    question,
    spaceContext,
  });

  if (!result.output) {
    throw new Error("Chatbot workflow failed to produce output");
  }

  console.log("[Chatbot] Workflow completed successfully");
  return result.output;
}