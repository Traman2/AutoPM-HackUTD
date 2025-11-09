# Agents Overview

This directory contains LangGraph-powered agents for product management and development workflows.

## Agents

### 1. ideaAgent
**Purpose**: Researches problems/ideas using internet search and provides structured analysis.

**LangGraph Structure**:
```
START → researchProblem → analyzeAndStructure → END
```

**Output Schema**:
```typescript
{
  title: string,
  summary: string,
  solutions: string[],
  sources: string[]
}
```

**Key Features**: Uses Tavily search tool with React agent pattern, structured output with Gemini

---

### 2. OKR Agent
**Purpose**: RAG-powered Q&A system for analyzing OKR documents (PDF).

**Architecture**:
- PDF loader with chunking (1500 char chunks, 300 overlap)
- Keyword-based retrieval
- Gemini 2.0 Flash for answers

**Output**: Markdown-formatted answers based on document context

**Special Functions**:
- `analyzeOKR(question)` - Answer specific questions
- `getOKRSummary()` - Full document summary
- `clearOKRCache()` - Reload PDF

---

### 3. RICE Agent
**Purpose**: Feature prioritization using RICE scoring (Reach × Impact × Confidence / Effort).

**Output Schema**:
```typescript
{
  sortedFeatures: Array<{
    name: string,
    reach: number,
    impact: number,
    confidence: number,
    effort: number,
    rice_score: number
  }>,
  analysis: string
}
```

**Key Features**: Calculates scores, sorts features, provides stakeholder-friendly analysis

---

### 4. Search Agent
**Purpose**: Internet research + structured analysis for product ideas.

**LangGraph Structure**:
```
START → researchProblem → analyzeAndStructure → END
```

**Output Schema**:
```typescript
{
  title: string,
  summary: string,
  solutions: string[],
  sources: string[]
}
```

**Key Features**: Similar to ideaAgent but with enhanced URL extraction and source tracking

---

### 5. Story Agent
**Purpose**: Generates user stories from epic descriptions.

**Output Format** (Markdown):
- User Story (As a..., I want..., so that...)
- Acceptance Criteria (Gherkin format)
- Non-Functional Requirements (Performance, Reliability, UX)
- Telemetry Plan (Event names, properties, questions)

**Model**: Gemini 2.0 Flash with structured prompting

---

### 6. Wireframe Agent
**Purpose**: Generates modern HTML wireframes from text descriptions.

**Output**: Complete HTML document with:
- Embedded CSS (gradients, shadows, modern styling)
- Responsive design
- Semantic HTML5
- No external dependencies

**Key Features**:
- Advanced prompt engineering for visual design
- Automatic HTML extraction from model response
- Fallback error handling

---

### 7. Gmail Agent
**Purpose**: Analyzes team members and sends personalized task assignment emails.

**LangGraph Structure**:
```
START → analyzeRelevantUsers → generateAndSendEmails → createOutputSummary → END
```

**Input Schema**:
```typescript
{
  users: Array<{
    email: string,
    name: string,
    role: string,
    description: string
  }>,
  solutionPlan: string
}
```

**Output Schema**:
```typescript
{
  totalUsers: number,
  relevantUsers: number,
  emailsSent: number,
  results: Array<{
    email: string,
    name: string,
    role: string,
    success: boolean,
    error?: string
  }>,
  summary: string
}
```

**Key Features**:
- AI determines which team members are relevant based on role/description
- Generates personalized emails for each user
- Uses Gmail API with OAuth tokens
- Sends via authenticated user's Gmail account
- Requires Google OAuth connection

**Requirements**:
- User must be authenticated (Auth0)
- User must have connected Google account
- Gmail send permissions (`gmail.send` scope)

---

## Common Patterns

**Models Used**:
- Gemini 2.0 Flash Exp (most agents)
- Gemini 2.5 Pro (ideaAgent)

**Tools**:
- Tavily Search (ideaAgent, search)
- PDF Loader (okr)
- Structured Output (ideaAgent, search)

**API Structure**:
- All agents expose via `/api/agents/{name}` POST endpoints
- Consistent error handling and response format
- Environment variables for API keys (GOOGLE_API_KEY, TAVILY_API_KEY)