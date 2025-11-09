import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { z } from "zod";
import axios from "axios";

// Helper function to refresh Jira access token
async function refreshJiraAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    console.log('[refreshJiraAccessToken] Refreshing Jira access token...');
    const response = await axios.post(
      'https://auth.atlassian.com/oauth/token',
      {
        grant_type: 'refresh_token',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        refresh_token: refreshToken,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log('[refreshJiraAccessToken] Token refreshed successfully');
    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error: any) {
    console.error('[refreshJiraAccessToken] Error refreshing token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Jira access token. Please reconnect your Jira account.');
  }
}

// Team member from email agent results
export interface TeamMemberResult {
  email: string;
  name: string;
  role: string;
}

// Jira project interface
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  style?: string;
  avatarUrls?: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
}

// Jira ticket interface
export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  assignee?: string;
  status: string;
}

// Final output
export interface JiraAgentOutput {
  projectKey: string;
  projectName: string;
  projectUrl: string;
  invitedUsers: number;
  ticketsCreated: number;
  tickets: JiraTicket[];
  summary: string;
}

// Schema for AI to generate tickets from solution plan
const TicketsSchema = z.object({
  tickets: z.array(z.object({
    summary: z.string().describe("Brief ticket title (max 100 chars)"),
    description: z.string().describe("Detailed ticket description"),
    assigneeEmail: z.string().optional().describe("Email of team member to assign this ticket to"),
  })).describe("Array of Jira tickets to create"),
  reasoning: z.string().describe("Brief explanation of how tickets were structured"),
});

// Jira API helper functions
async function getJiraCloudId(accessToken: string): Promise<string> {
  try {
    const response = await axios.get(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (response.data.length === 0) {
      throw new Error('No accessible Jira sites found');
    }

    return response.data[0].id;
  } catch (error) {
    console.error('Error fetching Jira cloud ID:', error);
    throw error;
  }
}

// Function to list all Jira projects
export async function listJiraProjects(accessToken: string): Promise<JiraProject[]> {
  try {
    console.log('[listJiraProjects] Fetching Jira cloud ID');
    const cloudId = await getJiraCloudId(accessToken);
    console.log(`[listJiraProjects] Cloud ID: ${cloudId}`);

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`,
      {
        params: {
          maxResults: 100, // Get up to 100 projects
          orderBy: 'name',
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    console.log(`[listJiraProjects] Found ${response.data.values?.length || 0} projects`);

    return response.data.values.map((project: any) => ({
      id: project.id,
      key: project.key,
      name: project.name,
      projectTypeKey: project.projectTypeKey,
      style: project.style,
      avatarUrls: project.avatarUrls,
    }));
  } catch (error: any) {
    console.error('[listJiraProjects] Error fetching projects:', error.response?.data || error.message);
    throw error;
  }
}

async function createJiraProject(
  accessToken: string,
  cloudId: string,
  projectName: string,
  projectKey: string
): Promise<{ key: string; id: string; url: string }> {
  try {
    const response = await axios.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
      {
        key: projectKey,
        name: projectName,
        projectTypeKey: 'software',
        projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-agility-kanban',
        description: `Project created for: ${projectName}`,
        leadAccountId: undefined, // Will use current user
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      key: response.data.key,
      id: response.data.id,
      url: response.data.self,
    };
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.errorMessages) {
      console.error('Project creation error:', error.response.data.errorMessages);
    }
    console.error('Error creating Jira project:', error.response?.data || error.message);
    throw error;
  }
}

async function getUserAccountId(
  accessToken: string,
  cloudId: string,
  email: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/user/search`,
      {
        params: { query: email },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (response.data.length > 0) {
      return response.data[0].accountId;
    }
    return null;
  } catch (error) {
    console.error(`Error finding user ${email}:`, error);
    return null;
  }
}

async function inviteUserToProject(
  accessToken: string,
  cloudId: string,
  projectKey: string,
  accountId: string
): Promise<boolean> {
  try {
    await axios.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}/role`,
      {
        user: [accountId],
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return true;
  } catch (error) {
    console.error(`Error inviting user to project:`, error);
    return false;
  }
}

async function createJiraTicket(
  accessToken: string,
  cloudId: string,
  projectKey: string,
  summary: string,
  description: string,
  assigneeAccountId?: string
): Promise<JiraTicket> {
  try {
    const issueData: any = {
      fields: {
        project: {
          key: projectKey,
        },
        summary: summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description,
                },
              ],
            },
          ],
        },
        issuetype: {
          name: 'Task',
        },
      },
    };

    if (assigneeAccountId) {
      issueData.fields.assignee = { accountId: assigneeAccountId };
    }

    const response = await axios.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`,
      issueData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      key: response.data.key,
      summary: summary,
      description: description,
      assignee: assigneeAccountId,
      status: 'To Do',
    };
  } catch (error: any) {
    console.error('Error creating Jira ticket:', error.response?.data || error.message);
    throw error;
  }
}

// State annotation for LangGraph
const StateAnnotation = Annotation.Root({
  solutionPlan: Annotation<string>,
  teamMembers: Annotation<TeamMemberResult[]>,
  projectKey: Annotation<string>,
  projectName: Annotation<string>,
  projectUrl: Annotation<string>,
  cloudId: Annotation<string>,
  ticketPlans: Annotation<any[]>,
  reasoning: Annotation<string>,
  createdTickets: Annotation<JiraTicket[]>,
  invitedCount: Annotation<number>,
  output: Annotation<JiraAgentOutput | null>,
});

// Node 1: Generate ticket plans using AI
async function generateTicketPlans(state: typeof StateAnnotation.State) {
  console.log("1. Generating ticket plans from solution");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.4,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredOutputModel = model.withStructuredOutput(TicketsSchema);

  // Prepare team member info
  const teamInfo = state.teamMembers.map(m =>
    `- ${m.name} (${m.email}): ${m.role}`
  ).join('\n');

  const result = await structuredOutputModel.invoke([
    {
      role: "system",
      content: `You are an expert project manager who breaks down solution plans into actionable Jira tickets.

Your job is to analyze the solution plan and create a comprehensive set of Jira tickets that:
1. Cover all aspects of the implementation
2. Are appropriately sized (not too large, not too small)
3. Are assigned to team members based on their roles
4. Follow best practices for ticket writing (clear summary, detailed description)

Each ticket should have:
- A clear, concise summary (max 100 characters)
- A detailed description with acceptance criteria
- An assignee from the team (match role to task type)`,
    },
    {
      role: "user",
      content: `Solution Plan to Implement:
${state.solutionPlan}

Team Members Available:
${teamInfo}

Create a comprehensive set of Jira tickets to implement this solution. Assign each ticket to the most appropriate team member based on their role.`,
    },
  ]);

  console.log(`2. Generated ${result.tickets.length} ticket plans`);
  console.log(`   Reasoning: ${result.reasoning}`);

  return {
    ticketPlans: result.tickets,
    reasoning: result.reasoning,
  };
}

// Node 2: Create Jira tickets
async function createTickets(
  state: typeof StateAnnotation.State,
  accessToken: string
) {
  console.log("3. Creating Jira tickets");

  const createdTickets: JiraTicket[] = [];

  // Build email to accountId mapping
  const emailToAccountId = new Map<string, string>();

  for (const member of state.teamMembers) {
    const accountId = await getUserAccountId(accessToken, state.cloudId, member.email);
    if (accountId) {
      emailToAccountId.set(member.email, accountId);
    }
  }

  for (const ticketPlan of state.ticketPlans) {
    console.log(`   Creating ticket: ${ticketPlan.summary}`);

    const assigneeAccountId = ticketPlan.assigneeEmail
      ? emailToAccountId.get(ticketPlan.assigneeEmail)
      : undefined;

    try {
      const ticket = await createJiraTicket(
        accessToken,
        state.cloudId,
        state.projectKey,
        ticketPlan.summary,
        ticketPlan.description,
        assigneeAccountId
      );

      createdTickets.push(ticket);
      console.log(`   ✓ Created ticket ${ticket.key}: ${ticket.summary}`);
    } catch (error) {
      console.error(`   ✗ Failed to create ticket: ${ticketPlan.summary}`, error);
    }
  }

  console.log("4. Ticket creation completed");

  return { createdTickets };
}

// Node 3: Create final output summary
async function createOutputSummary(state: typeof StateAnnotation.State) {
  console.log("5. Creating output summary");

  const output: JiraAgentOutput = {
    projectKey: state.projectKey,
    projectName: state.projectName,
    projectUrl: state.projectUrl,
    invitedUsers: state.invitedCount,
    ticketsCreated: state.createdTickets.length,
    tickets: state.createdTickets,
    summary: `Created Jira project "${state.projectName}" (${state.projectKey}) with ${state.createdTickets.length} tickets. Invited ${state.invitedCount} team members to the project. ${state.reasoning}`,
  };

  console.log("6. Jira agent workflow completed");

  return { output };
}

// NEW: Main workflow to add tickets to an EXISTING project
export async function addTicketsToProject(
  solutionPlan: string,
  teamMembers: TeamMemberResult[],
  accessToken: string,
  projectKey: string,
  projectName: string
): Promise<JiraAgentOutput> {
  console.log(`[addTicketsToProject] Starting workflow for project: ${projectKey}`);

  // Step 1: Get cloud ID
  console.log('[addTicketsToProject] Getting Jira cloud ID');
  const cloudId = await getJiraCloudId(accessToken);
  console.log(`[addTicketsToProject] Cloud ID: ${cloudId}`);

  // Step 2: Build the project URL
  const projectUrl = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`;

  // Step 3: Create LangGraph workflow for ticket generation
  const workflow = new StateGraph(StateAnnotation)
    .addNode("generateTicketPlans", generateTicketPlans)
    .addNode("createTickets", async (state) =>
      createTickets(state, accessToken)
    )
    .addNode("createOutputSummary", createOutputSummary)
    .addEdge("__start__", "generateTicketPlans")
    .addEdge("generateTicketPlans", "createTickets")
    .addEdge("createTickets", "createOutputSummary")
    .addEdge("createOutputSummary", "__end__")
    .compile();

  // Execute workflow
  const result = await workflow.invoke({
    solutionPlan,
    teamMembers,
    projectKey,
    projectName,
    projectUrl,
    cloudId,
    invitedCount: 0, // Not inviting users in this new flow
  });

  if (!result.output) {
    throw new Error("Workflow failed to produce output");
  }

  console.log(`[addTicketsToProject] Successfully created ${result.output.ticketsCreated} tickets`);
  return result.output;
}

// DEPRECATED: Old workflow that creates a new project
// Kept for backward compatibility but should not be used
export async function createJiraWorkflow(
  solutionPlan: string,
  teamMembers: TeamMemberResult[],
  accessToken: string,
  refreshToken: string,
  projectName: string
): Promise<JiraAgentOutput> {
  console.log("Starting Jira agent workflow");

  // Step 1: Get cloud ID
  console.log("0. Getting Jira cloud ID");
  const cloudId = await getJiraCloudId(accessToken);
  console.log(`   Cloud ID: ${cloudId}`);

  // Step 2: Create project
  // Generate a unique project key from project name
  const projectKey = projectName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10) + Date.now().toString().substring(-4);

  console.log(`   Creating project with key: ${projectKey}`);

  const project = await createJiraProject(
    accessToken,
    cloudId,
    projectName,
    projectKey
  );

  console.log(`   ✓ Project created: ${project.key}`);

  // Step 3: Invite team members to project
  console.log("   Inviting team members to project");
  let invitedCount = 0;

  for (const member of teamMembers) {
    const accountId = await getUserAccountId(accessToken, cloudId, member.email);
    if (accountId) {
      const invited = await inviteUserToProject(accessToken, cloudId, project.key, accountId);
      if (invited) {
        invitedCount++;
        console.log(`   ✓ Invited ${member.name} to project`);
      }
    }
  }

  console.log(`   Invited ${invitedCount}/${teamMembers.length} team members`);

  // Step 4: Create LangGraph workflow for ticket generation
  const workflow = new StateGraph(StateAnnotation)
    .addNode("generateTicketPlans", generateTicketPlans)
    .addNode("createTickets", async (state) =>
      createTickets(state, accessToken)
    )
    .addNode("createOutputSummary", createOutputSummary)
    .addEdge("__start__", "generateTicketPlans")
    .addEdge("generateTicketPlans", "createTickets")
    .addEdge("createTickets", "createOutputSummary")
    .addEdge("createOutputSummary", "__end__")
    .compile();

  // Execute workflow
  const result = await workflow.invoke({
    solutionPlan,
    teamMembers,
    projectKey: project.key,
    projectName: projectName,
    projectUrl: project.url,
    cloudId,
    invitedCount,
  });

  if (!result.output) {
    throw new Error("Workflow failed to produce output");
  }

  return result.output;
}
