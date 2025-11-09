import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================
// IDEA AGENT DATA
// ============================================
// Schema from: app/api/agents/ideaAgent/ideaAgent.ts (IdeaAnalysisSchema)
interface IIdeaAgentData {
  title?: string;
  summary?: string;
  solutions?: string[];  // Array of solution strings
  sources?: string[];    // Array of URLs from research
  selectedSolution?: string;  // User's selected solution
  generatedAt?: Date;
}

// ============================================
// STORY AGENT DATA
// ============================================
// Schema from: app/api/agents/story/tools.ts
// Returns: Markdown string with user story, acceptance criteria, NFRs, and telemetry plan
interface IStoryAgentData {
  storyMarkdown?: string;  // Complete markdown formatted story
  generatedAt?: Date;
}

// ============================================
// EMAIL AGENT DATA (Gmail Agent)
// ============================================
// Schema from: app/api/agents/gmailAgent/tools.ts (GmailAgentOutput)
interface IEmailResult {
  email: string;
  name: string;
  role: string;
  success: boolean;
  error?: string;
}

interface IEmailAgentData {
  totalUsers?: number;
  relevantUsers?: number;
  emailsSent?: number;
  results?: IEmailResult[];
  summary?: string;
  generatedAt?: Date;
}

// ============================================
// RICE AGENT DATA
// ============================================
// Schema from: app/api/agents/rice/tools.ts (Feature interface + analysis)
interface IFeature {
  name: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  rice_score?: number;
}

interface IRICEAgentData {
  features?: IFeature[];  // Original features generated from solution
  sortedFeatures?: IFeature[];  // Features sorted by RICE score
  analysis?: string;  // AI-generated analysis text
  generatedAt?: Date;
}

// ============================================
// OKR AGENT DATA
// ============================================
// Schema from: app/api/agents/okr/tools.ts
// Returns: Markdown string with OKR analysis/summary
interface IOKRAgentData {
  summary?: string;       // Markdown formatted OKR summary from PDF
  analysis?: string;      // Markdown formatted OKR analysis (Q&A response)
  question?: string;      // User's question (if in Q&A mode)
  fileName?: string;      // Name of uploaded PDF file
  generatedAt?: Date;
}

// ============================================
// WIREFRAME AGENT DATA
// ============================================
// Schema from: app/api/agents/wireframe/tools.ts
// Returns: Array of HTML pages
interface IWireframePage {
  name: string;         // Page name (e.g., "Landing Page", "Dashboard")
  description: string;  // Brief description of the page
  html: string;        // Complete HTML code
}

interface IWireframeAgentData {
  pages?: IWireframePage[];  // Array of wireframe pages
  generatedAt?: Date;
}

// ============================================
// JIRA AGENT DATA
// ============================================
// Schema from: app/api/agents/jiraAgent/tools.ts
// Returns: Project info and created tickets
interface IJiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  assignee?: string;
  status: string;
}

interface IJiraAgentData {
  projectKey?: string;
  projectName?: string;
  projectUrl?: string;
  invitedUsers?: number;
  ticketsCreated?: number;
  tickets?: IJiraTicket[];
  summary?: string;
  generatedAt?: Date;
}

// ============================================
// SPACE DOCUMENT INTERFACE
// ============================================
export interface ISpace extends Document {
  userId: string; // Auth0 sub
  name: string;
  problemStatement: string;
  currentStep: number; // 1-7 (Idea, Story, Email, RICE, OKR, Wireframe, Jira)
  completed: boolean;

  // Agent workflow data - each step stores its exact output
  ideaAgent?: IIdeaAgentData;
  storyAgent?: IStoryAgentData;
  emailAgent?: IEmailAgentData;
  riceAgent?: IRICEAgentData;
  okrAgent?: IOKRAgentData;
  wireframeAgent?: IWireframeAgentData;
  jiraAgent?: IJiraAgentData;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MONGOOSE SCHEMAS
// ============================================

const IdeaAgentDataSchema = new Schema<IIdeaAgentData>({
  title: String,
  summary: String,
  solutions: [String],
  sources: [String],
  selectedSolution: String,
  generatedAt: Date,
}, { _id: false });

const StoryAgentDataSchema = new Schema<IStoryAgentData>({
  storyMarkdown: String,
  generatedAt: Date,
}, { _id: false });

const EmailResultSchema = new Schema<IEmailResult>({
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  success: { type: Boolean, required: true },
  error: String,
}, { _id: false });

const EmailAgentDataSchema = new Schema<IEmailAgentData>({
  totalUsers: Number,
  relevantUsers: Number,
  emailsSent: Number,
  results: [EmailResultSchema],
  summary: String,
  generatedAt: Date,
}, { _id: false });

const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true },
  reach: { type: Number, required: true },
  impact: { type: Number, required: true },
  confidence: { type: Number, required: true },
  effort: { type: Number, required: true },
  rice_score: Number,
}, { _id: false });

const RICEAgentDataSchema = new Schema<IRICEAgentData>({
  features: [FeatureSchema],
  sortedFeatures: [FeatureSchema],
  analysis: String,
  generatedAt: Date,
}, { _id: false });

const OKRAgentDataSchema = new Schema<IOKRAgentData>({
  summary: String,
  analysis: String,
  question: String,
  fileName: String,
  generatedAt: Date,
}, { _id: false });

const WireframePageSchema = new Schema<IWireframePage>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  html: { type: String, required: true },
}, { _id: false });

const WireframeAgentDataSchema = new Schema<IWireframeAgentData>({
  pages: [WireframePageSchema],
  generatedAt: Date,
}, { _id: false });

const JiraTicketSchema = new Schema<IJiraTicket>({
  id: { type: String, required: true },
  key: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  assignee: String,
  status: { type: String, required: true },
}, { _id: false });

const JiraAgentDataSchema = new Schema<IJiraAgentData>({
  projectKey: String,
  projectName: String,
  projectUrl: String,
  invitedUsers: Number,
  ticketsCreated: Number,
  tickets: [JiraTicketSchema],
  summary: String,
  generatedAt: Date,
}, { _id: false });

// ============================================
// MAIN SPACE SCHEMA
// ============================================

const SpaceSchema = new Schema<ISpace>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Space name is required'],
    trim: true,
    minlength: [1, 'Space name must be at least 1 character'],
    maxlength: [200, 'Space name cannot exceed 200 characters'],
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true,
    minlength: [10, 'Problem statement must be at least 10 characters'],
    maxlength: [5000, 'Problem statement cannot exceed 5000 characters'],
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 7,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  
  // Agent data fields
  ideaAgent: {
    type: IdeaAgentDataSchema,
    default: undefined,
  },
  storyAgent: {
    type: StoryAgentDataSchema,
    default: undefined,
  },
  emailAgent: {
    type: EmailAgentDataSchema,
    default: undefined,
  },
  riceAgent: {
    type: RICEAgentDataSchema,
    default: undefined,
  },
  okrAgent: {
    type: OKRAgentDataSchema,
    default: undefined,
  },
  wireframeAgent: {
    type: WireframeAgentDataSchema,
    default: undefined,
  },
  jiraAgent: {
    type: JiraAgentDataSchema,
    default: undefined,
  },
}, {
  timestamps: true,
  collection: 'spaces',
});

// Indexes for efficient querying
SpaceSchema.index({ userId: 1, createdAt: -1 });
SpaceSchema.index({ userId: 1, completed: 1 });

// Static methods
SpaceSchema.statics = {
  findByUserId(userId: string) {
    return this.find({ userId }).sort({ createdAt: -1 });
  },
  
  findByUserIdAndCompleted(userId: string, completed: boolean) {
    return this.find({ userId, completed }).sort({ createdAt: -1 });
  },
};

const Space: Model<ISpace> = mongoose.models.Space || mongoose.model<ISpace>('Space', SpaceSchema);

export default Space;
