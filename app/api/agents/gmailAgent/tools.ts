import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { google } from 'googleapis';

// User interface for input
export interface TeamMember {
  email: string;
  name: string;
  role: string;
  description: string;
}

// Email sending result
export interface EmailResult {
  email: string;
  name: string;
  role: string;
  success: boolean;
  error?: string;
}

// Final output
export interface GmailAgentOutput {
  totalUsers: number;
  relevantUsers: number;
  emailsSent: number;
  results: EmailResult[];
  summary: string;
}

// Schema for AI to determine relevant users
const RelevantUsersSchema = z.object({
  relevantEmails: z.array(z.string()).describe("Array of email addresses that are relevant to the task"),
  reasoning: z.string().describe("Brief explanation of why these users were selected"),
});

// Send email tool
async function sendEmail(
  targetEmail: string,
  subject: string,
  content: string,
  accessToken: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email in RFC 2822 format
    const message = [
      `To: ${targetEmail}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      content
    ].join('\n');

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${targetEmail}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// State annotation for LangGraph
const StateAnnotation = Annotation.Root({
  users: Annotation<TeamMember[]>,
  solutionPlan: Annotation<string>,
  relevantEmails: Annotation<string[]>,
  reasoning: Annotation<string>,
  emailResults: Annotation<EmailResult[]>,
  output: Annotation<GmailAgentOutput | null>,
});

// Node 1: Analyze which users are relevant to the task
async function analyzeRelevantUsers(state: typeof StateAnnotation.State) {
  console.log("1. Analyzing which users are relevant to the task");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredOutputModel = model.withStructuredOutput(RelevantUsersSchema);

  // Prepare user info
  const userInfo = state.users.map(u =>
    `- ${u.name} (${u.email}): ${u.role} - ${u.description}`
  ).join('\n');

  const result = await structuredOutputModel.invoke([
    {
      role: "system",
      content: `You are an expert at analyzing team members' roles and responsibilities to determine who should be involved in a task.

Your job is to identify which team members are relevant to the given solution plan based on their role and description.

IMPORTANT: Only select users whose role and description directly relate to implementing or being affected by the solution plan. Do not select all users - be selective and specific.`,
    },
    {
      role: "user",
      content: `Team Members:
${userInfo}

Solution Plan to Implement:
${state.solutionPlan}

Analyze the solution plan and determine which team members' roles and descriptions are relevant to this task. Return ONLY the email addresses of relevant team members.`,
    },
  ]);

  console.log(`2. Found ${result.relevantEmails.length} relevant users`);
  console.log(`   Reasoning: ${result.reasoning}`);

  return {
    relevantEmails: result.relevantEmails,
    reasoning: result.reasoning,
  };
}

// Node 2: Generate and send emails
async function generateAndSendEmails(
  state: typeof StateAnnotation.State,
  accessToken: string,
  refreshToken: string,
  senderName: string
) {
  console.log("3. Generating and sending emails");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const emailResults: EmailResult[] = [];

  // Filter relevant users
  const relevantUsers = state.users.filter(u =>
    state.relevantEmails.includes(u.email)
  );

  for (const user of relevantUsers) {
    console.log(`   Generating email for ${user.name} (${user.email})`);

    // Generate personalized email content
    const emailPrompt = `You are writing a professional email to assign a task to a team member.

Team Member: ${user.name}
Role: ${user.role}
Responsibilities: ${user.description}

Solution Plan:
${state.solutionPlan}

Write a professional, clear, and actionable email that:
1. Greets the recipient by name
2. Explains the solution plan and why their expertise is needed
3. Clearly outlines what they need to do to implement their part of the task
4. Provides any necessary context or background
5. Ends professionally with an offer to discuss further if needed
6. Signs off from ${senderName}

The email should be well-formatted with proper line breaks and professional tone. Return ONLY the email body content (no subject line).`;

    try {
      const emailContent = await model.invoke([new HumanMessage(emailPrompt)]);
      const content = emailContent.content as string;

      const subject = `Action Required: ${state.solutionPlan.substring(0, 60)}${state.solutionPlan.length > 60 ? '...' : ''}`;

      // Send the email
      const sendResult = await sendEmail(
        user.email,
        subject,
        content,
        accessToken,
        refreshToken
      );

      emailResults.push({
        email: user.email,
        name: user.name,
        role: user.role,
        success: sendResult.success,
        error: sendResult.error,
      });

      console.log(`   ${sendResult.success ? '✓' : '✗'} Email to ${user.name}: ${sendResult.success ? 'sent' : 'failed'}`);
    } catch (error) {
      console.error(`   Error processing email for ${user.name}:`, error);
      emailResults.push({
        email: user.email,
        name: user.name,
        role: user.role,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log("4. Email sending completed");

  return { emailResults };
}

// Node 3: Create final output summary
async function createOutputSummary(state: typeof StateAnnotation.State) {
  console.log("5. Creating output summary");

  const successfulEmails = state.emailResults.filter(r => r.success).length;

  const output: GmailAgentOutput = {
    totalUsers: state.users.length,
    relevantUsers: state.relevantEmails.length,
    emailsSent: successfulEmails,
    results: state.emailResults,
    summary: `Analyzed ${state.users.length} team members and identified ${state.relevantEmails.length} relevant users for the task. Successfully sent ${successfulEmails} out of ${state.emailResults.length} emails. ${state.reasoning}`,
  };

  console.log("6. Gmail agent workflow completed");

  return { output };
}

// Main workflow
export async function sendTaskEmails(
  users: TeamMember[],
  solutionPlan: string,
  accessToken: string,
  refreshToken: string,
  senderName: string
): Promise<GmailAgentOutput> {
  console.log("Starting Gmail agent workflow");

  // Create workflow
  const workflow = new StateGraph(StateAnnotation)
    .addNode("analyzeRelevantUsers", analyzeRelevantUsers)
    .addNode("generateAndSendEmails", async (state) =>
      generateAndSendEmails(state, accessToken, refreshToken, senderName)
    )
    .addNode("createOutputSummary", createOutputSummary)
    .addEdge("__start__", "analyzeRelevantUsers")
    .addEdge("analyzeRelevantUsers", "generateAndSendEmails")
    .addEdge("generateAndSendEmails", "createOutputSummary")
    .addEdge("createOutputSummary", "__end__")
    .compile();

  // Execute workflow
  const result = await workflow.invoke({
    users,
    solutionPlan,
  });

  if (!result.output) {
    throw new Error("Workflow failed to produce output");
  }

  return result.output;
}
