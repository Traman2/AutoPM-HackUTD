# Product Manager Agent Tools - UI Implementation Plan

## Project Overview
A Next.js-based product management platform featuring an AI-powered agent workflow system. Users create "spaces" to develop product solutions through specialized agents, with complete workflow state management in MongoDB.

---

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS 3.4+
- **HTTP Client**: Axios for API communication
- **Database**: MongoDB with Mongoose ODM
- **State**: React Context API or Zustand (lightweight)
- **Icons**: Lucide React
- **Fonts**: Inter (primary font family)

---

## Color System & Design Tokens

### Primary Color Palette
Based on the screenshot analysis, implement these exact colors:

```
PRIMARY COLORS:
- Rose/Mauve (Primary Brand): #9B6B7A
- Rose/Mauve Hover: #8A5A69
- Rose/Mauve Light: #B98999
- Rose/Mauve Ultra Light (backgrounds): rgba(155, 107, 122, 0.08)

NEUTRAL COLORS:
- Background Primary: #F5F5F7 (light gray, subtle warm tone)
- Background Secondary: #FAFAFA
- Card Background: #FFFFFF
- Border Default: #E5E5E5
- Border Hover: #D4D4D4
- Border Focus: #9B6B7A

TEXT COLORS:
- Text Primary: #1A1A1A (almost black)
- Text Secondary: #6B6B6B (medium gray)
- Text Tertiary: #9CA3AF (light gray)
- Text Placeholder: #D1D5DB

ACCENT COLORS:
- Success Green: #10B981
- Success Light: #D1FAE5
- Warning Orange: #F59E0B
- Warning Light: #FEF3C7
- Info Blue: #3B82F6
- Info Light: #DBEAFE
- Error Red: #EF4444
- Error Light: #FEE2E2

DEPARTMENT/CATEGORY COLORS:
- Purple Indicator: #8B5CF6 (Design Department)
- Orange Indicator: #F97316 (Engineering Department)
- Blue Indicator: #3B82F6 (Product)
- Green Indicator: #10B981 (Marketing)

PROGRESS INDICATORS:
- Active/Completed Dot: #9B6B7A
- Inactive Dot: #E5E5E5
- In Progress Dot: #F59E0B
```

### Shadow System
```
shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)

Special card shadow (on hover): 0 4px 12px rgba(155, 107, 122, 0.15)
```

### Border Radius System
```
rounded-sm: 4px (small elements, badges)
rounded-md: 6px (inputs, small buttons)
rounded-lg: 8px (buttons, tags)
rounded-xl: 12px (cards, major containers)
rounded-2xl: 16px (modals, large sections)
rounded-full: 9999px (avatars, circular badges)
```

### Spacing Scale
```
Use Tailwind's default spacing with emphasis on:
- 4px (1) - Tight spacing
- 8px (2) - Very close elements
- 12px (3) - Close related items
- 16px (4) - Standard gap between elements
- 24px (6) - Section internal spacing
- 32px (8) - Section separation
- 48px (12) - Major section gaps
- 64px (16) - Page-level spacing
```

---

## Typography System

### Font Families
```
Primary Font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'SF Mono', Monaco, 'Cascadia Code', monospace (for code snippets)
```

### Font Sizes & Weights
```
HEADINGS:
- Page Title: text-3xl (30px), font-semibold (600), tracking-tight, text-gray-900
- Section Title: text-2xl (24px), font-semibold (600), text-gray-900
- Subsection: text-xl (20px), font-semibold (600), text-gray-800
- Card Title: text-lg (18px), font-semibold (600), text-gray-900
- Small Heading: text-base (16px), font-semibold (600), text-gray-800

BODY TEXT:
- Body Large: text-base (16px), font-normal (400), text-gray-700
- Body Default: text-sm (14px), font-normal (400), text-gray-600
- Body Small: text-xs (12px), font-normal (400), text-gray-500
- Caption: text-xs (12px), font-medium (500), text-gray-500

LABELS & UI:
- Button Text: text-sm (14px), font-semibold (600)
- Input Label: text-sm (14px), font-medium (500), text-gray-700
- Badge Text: text-xs (12px), font-medium (500)
- Meta Info: text-xs (12px), font-normal (400), text-gray-500

LINE HEIGHTS:
- Tight: leading-tight (1.25)
- Normal: leading-normal (1.5)
- Relaxed: leading-relaxed (1.625)
- Loose: leading-loose (2)
```

---

## Design Patterns & UI Components

### Pattern 1: Card Components
All cards follow this structure from the screenshots:

**Standard Card Pattern:**
- White background (#FFFFFF)
- Border radius: 12px (rounded-xl)
- Padding: 24px (p-6)
- Shadow: shadow-sm at rest
- Shadow: shadow-md on hover
- Transition: all 200ms ease-in-out
- Border: 1px solid transparent (becomes rose/mauve when active/selected)

**Card Hover State:**
- Subtle lift: transform translateY(-2px)
- Enhanced shadow: shadow-md
- Border color shifts to very light rose/mauve

**Card Active/Selected State:**
- Border: 2px solid #9B6B7A
- Background: Very subtle rose tint rgba(155, 107, 122, 0.02)
- No transform (stays grounded)

### Pattern 2: Button System

**Primary Button (Rose/Mauve):**
- Background: #9B6B7A
- Text: White, font-semibold
- Padding: px-6 py-2.5 (larger actions) or px-4 py-2 (standard)
- Border radius: rounded-lg (8px)
- Hover: Background darkens to #8A5A69, slight scale (scale-102)
- Active: Scale down to scale-98
- Disabled: Opacity 50%, cursor-not-allowed
- Icon spacing: gap-2 between icon and text

**Secondary/Ghost Button:**
- Background: Transparent
- Border: 1px solid #E5E5E5
- Text: #1A1A1A, font-semibold
- Padding: px-4 py-2
- Hover: Background #F5F5F7, border #D4D4D4
- Active: Background #EBEBEB

**Tertiary/Text Button:**
- Background: Transparent
- No border
- Text: #6B6B6B, font-medium
- Hover: Text color to #9B6B7A, underline
- Padding: Minimal (px-2 py-1)

**Icon Button:**
- Square or circular
- Padding: p-2 (32px total with icon)
- Background: Transparent or light gray
- Hover: Background #F5F5F7, icon color to #9B6B7A
- Icons: 20px size (w-5 h-5)

**Button with Arrow (CTA Pattern):**
- Text + right arrow icon (ArrowRight from lucide)
- Gap between text and arrow: gap-2
- Arrow animates on hover: translateX(2px)

### Pattern 3: Input Fields

**Text Input Pattern:**
- Border: 1px solid #E5E5E5
- Border radius: rounded-md (6px)
- Padding: px-4 py-2.5
- Font size: text-sm (14px)
- Background: White
- Transition: border-color 200ms ease

**Input States:**
- Focus: Border #9B6B7A, ring-4 ring-rose/mauve/10 (rose shadow)
- Error: Border #EF4444, ring-4 ring-red-100
- Disabled: Background #F5F5F7, text #9CA3AF, cursor-not-allowed
- Read-only: Background #FAFAFA, border #E5E5E5

**Textarea Pattern:**
- Same as text input
- Min height: 120px (h-32)
- Resize: vertical only
- Font: inherit body font
- Line height: leading-relaxed

**Label Pattern:**
- Font: text-sm, font-medium
- Color: #1A1A1A
- Margin bottom: mb-2
- Optional indicator: Text-gray-500 " (optional)"

### Pattern 4: Modal/Dialog

**Modal Structure (from Create Space screenshot):**
- Overlay: Fixed, inset-0, background rgba(0, 0, 0, 0.5), backdrop-blur-sm
- Container: Centered, max-width 600px (max-w-xl)
- Modal box: White background, rounded-2xl (16px), shadow-xl
- Padding: p-6 or p-8 for larger modals
- Header: pb-4, border-bottom border-gray-200
- Content: py-6
- Footer: pt-4, border-top border-gray-200, flex justify-end gap-3

**Modal Header:**
- Title: text-xl font-semibold
- Close button: Top right, p-2, hover:bg-gray-100, rounded-lg
- Close icon: X from lucide, size 20px

**Modal Animation:**
- Enter: Scale from 95% to 100%, opacity 0 to 1, duration 200ms
- Exit: Scale to 95%, opacity to 0, duration 150ms
- Overlay fade: 200ms

### Pattern 5: Navigation & Progress

**Agent Sidebar (Left Panel):**
- Fixed width: 220px on desktop
- Background: White or very light gray (#FAFAFA)
- Border right: 1px solid #E5E5E5
- Padding: p-6

**Agent Step Item:**
- Display: flex, align-items-center, gap-3
- Padding: px-4 py-3
- Border radius: rounded-lg
- Margin between steps: mb-2

**Step Number Circle:**
- Size: 32px (w-8 h-8)
- Border radius: rounded-full
- Display: flex, items-center, justify-center
- Font: text-sm font-semibold

**Step States:**
- Active: Circle background #9B6B7A, text white, step background rgba(155,107,122,0.08)
- Completed: Circle background #10B981, white checkmark icon, step text gray
- Pending: Circle border 2px solid #E5E5E5, text #6B6B6B, gray background
- Disabled: Opacity 40%, cursor-not-allowed

**Progress Dots (Horizontal):**
- Used in round/phase cards
- Dot size: 8px (w-2 h-2)
- Spacing: gap-1.5
- Completed dot: bg-rose/mauve
- Active dot: bg-orange with pulse animation
- Pending dot: bg-gray-300

### Pattern 6: Avatar System

**Avatar Sizes:**
- Extra small: 24px (w-6 h-6) - for dense lists
- Small: 32px (w-8 h-8) - for avatar stacks
- Medium: 40px (w-10 h-10) - for profile sections
- Large: 48px (w-12 h-12) - for main profiles
- Extra large: 64px (w-16 h-16) - for persona cards

**Avatar Stack Pattern:**
- Display: flex
- Avatars overlap: -ml-2 (except first)
- Border: 2px solid white (ring-2 ring-white)
- Z-index: Increase with each avatar
- Overflow counter: Same size, background #9B6B7A, text white, "+5" format

**Avatar Initials:**
- Font: font-semibold
- Size: Proportional to avatar size
- Background: Gradient or solid brand color
- Text: White

### Pattern 7: Badge & Tag System

**Status Badges:**
- Completed: bg-green-100, text-green-700, with green dot indicator
- In Progress: bg-orange-100, text-orange-700, with orange dot
- Pending: bg-gray-100, text-gray-600
- Failed/Error: bg-red-100, text-red-700

**Badge Structure:**
- Inline-flex items-center
- Gap between dot and text: gap-1.5
- Padding: px-2.5 py-1
- Border radius: rounded-full
- Font: text-xs font-medium

**Dot Indicator:**
- Size: 6px (w-1.5 h-1.5)
- Border radius: rounded-full
- Can pulse for active states: animate-pulse

**Department Tags:**
- Similar to badges but rounded-lg instead of rounded-full
- Background uses department color at 10% opacity
- Text uses department color at 700 weight
- No dot indicator

### Pattern 8: Section Headers

**Page Header Pattern:**
- Margin bottom: mb-8
- Title and actions row: flex justify-between items-center

**Section Header Pattern:**
- Margin bottom: mb-6
- Title: text-xl or text-2xl font-semibold
- Optional description: text-sm text-gray-600, mt-1
- Action buttons: Aligned to right

**Divider:**
- Height: 1px
- Background: #E5E5E5
- Margin: my-6 or my-8

### Pattern 9: Empty States

**Empty State Pattern:**
- Centered content: flex flex-col items-center justify-center
- Padding: py-12 or py-16
- Icon: 48px size, text-gray-400
- Heading: text-lg font-medium, text-gray-900, mt-4
- Description: text-sm text-gray-500, mt-2, max-w-md, text-center
- Action button: mt-6

### Pattern 10: Loading States

**Skeleton Pattern:**
- Background: #E5E5E5
- Animation: pulse (opacity 100% to 50%)
- Border radius: Matches content it replaces
- Height: Matches expected content

**Spinner:**
- Size: 20px for buttons, 32px for page loads
- Color: #9B6B7A
- Animation: spin (360deg rotation)
- Border: 2px with transparent bottom

**Loading Overlay:**
- Background: rgba(255, 255, 255, 0.8)
- Backdrop blur: backdrop-blur-sm
- Centered spinner
- Optional loading text below spinner

---

## Routing Structure & Agent Integration

### Critical Implementation Note

**IMPORTANT**: The backend API routes already exist in the codebase. The UI must integrate with these existing endpoints by examining their request/response schemas.

### Agent Route Integration Requirements

**Step 1: Examine Existing API Routes**
Before building any agent UI, you MUST:

1. **Read each route file** in the agents API directory to understand:
   - Request body schema (what data the agent expects)
   - Response schema (what data the agent returns)
   - Error handling patterns
   - Validation rules

2. **Identify required fields** from the route handlers:
   - Look for TypeScript interfaces or Zod schemas
   - Note which fields are required vs optional
   - Understand data types (string, number, array, object)

3. **Map response structure** to UI components:
   - See how agent returns data (nested objects, arrays, etc.)
   - Plan how to display this data in the UI
   - Determine which fields to show immediately vs on expand

**Step 2: Build Forms Based on Route Schemas**

For each agent, create forms that:
- Match the request schema exactly
- Include all required fields with proper validation
- Use appropriate input types (text, textarea, number, select, radio)
- Show clear labels matching the schema field names (in readable format)
- Display helper text for complex fields

**Step 3: Handle Agent Responses**

For each agent response:
- Parse the response according to the schema
- Display all returned data in appropriate UI components
- Handle nested objects/arrays correctly
- Show loading states during agent processing
- Handle errors gracefully with user-friendly messages

---

## MongoDB Schema Design Strategy

### Schema Discovery Process

**CRITICAL**: Before creating any Mongoose schema, you must:

1. **Analyze all API route handlers** to see what data they expect and return
2. **Examine the agent output structures** from the route files
3. **Identify common patterns** across agents
4. **Design schemas that support the entire workflow**

### Space Schema Requirements

The Space schema must store:

**Core Space Information:**
- `_id`: ObjectId (auto-generated by MongoDB)
- `name`: String, required, trimmed
- `problemStatement`: String, required, minimum 10 characters
- `createdAt`: Date, default Date.now
- `updatedAt`: Date, updated on every save
- `currentStep`: Number, 1-4, represents which agent is active
- `completed`: Boolean, true when all agents finished

**Agent-Specific Data Storage:**

Each agent section must store the exact structure returned by that agent's API route. Examine each route to determine the exact schema:

**Solution Agent Data:**
- Check the solution agent route for the response structure
- Store: title (String), summary (String), solutions (Array of Objects)
- Each solution object should have: id, title, description
- Store selectedSolutionId (String) for user's choice

**Story Agent Data:**
- Check the story agent route for response structure
- Store: persona object with all fields returned by the agent
- Common fields might include: name, age, role, techSavviness, background, goals array, painPoints array
- Adapt schema based on actual agent output

**Email Agent Data:**
- Check both email generation and email send routes
- Store: users array with email, role, emailContent, sent status, sentAt timestamp
- Track which emails were generated vs actually sent

**RICE Agent Data:**
- Check the RICE agent route for response structure
- Store: reach, impact, confidence, effort (all likely strings with explanations)
- Store: score (Number), priority (String)
- Store: stakeholderAnalysis (String, the paragraph)

### Schema Design Principles

1. **Flexibility**: Use nested objects and Mixed types where agent outputs may vary
2. **Validation**: Add validators only where business logic requires (not for agent-generated content)
3. **Indexes**: Index on createdAt, name, and currentStep for efficient querying
4. **Timestamps**: Use Mongoose timestamps option for automatic tracking
5. **Defaults**: Provide sensible defaults for workflow fields (currentStep: 1, completed: false)

### Workflow State Tracking

The schema must support:
- **Progress tracking**: currentStep field indicates which agent is active
- **Data retrieval**: Each agent can read previous agents' data
- **Partial saves**: Users can leave and return to incomplete workflows
- **Validation state**: Track which steps are complete/valid

---

## Page-by-Page UI Implementation

### Page 1: Dashboard (/)

**Layout Structure:**

Top Navigation Bar (Sticky, full width):
- Height: 64px (h-16)
- Background: White with shadow-sm
- Container: max-w-7xl mx-auto px-6
- Flex layout: justify-between items-center

Left section of nav:
- Logo/Icon button: 40px square, hover effect
- Search bar: w-80, bg-gray-50, rounded-lg, px-4 py-2, with search icon
- "Add person" button: Secondary style, icon + text

Right section of nav:
- Notifications bell: Icon button with red badge if unread
- Three-dot menu: Icon button
- Language selector: "En" with dropdown indicator
- Date display: text-sm text-gray-600, "November 17, 2025"
- Create button: Primary style, black background (special override), "Create →"

**Main Content Area:**

Container: max-w-7xl mx-auto px-6 py-12

Page Header:
- Title: "Product Spaces" (text-3xl font-semibold)
- Subtitle: "Create and manage your product ideation workflows" (text-gray-600 mt-2)

Space Grid:
- Display: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Minimum 3 columns on desktop, responsive down to 1 column on mobile

**Space Card Component:**
- Structure: Follows standard card pattern
- Clickable: Entire card is a button/link to the space
- Cursor: pointer

Card Content Layout:
- Top section: 
  - Space name: text-lg font-semibold, truncate if too long
  - Created date: text-xs text-gray-500, "Created Nov 15, 2025"
  
- Middle section:
  - Problem statement preview: text-sm text-gray-600, line-clamp-2 (max 2 lines)
  - Margin: my-4
  
- Bottom section:
  - Progress label: text-xs font-medium text-gray-700, "Progress"
  - Progress dots: flex gap-1.5 mt-2
    - 6 dots total (one per agent step + initial + complete)
    - Completed dots: bg-rose/mauve
    - Current dot: bg-orange with pulse
    - Future dots: bg-gray-300
  - Status text: text-xs text-gray-500 mt-2, "3 of 6 steps completed"

**Create Space Card:**
- Same size as space cards
- Dashed border: border-2 border-dashed border-gray-300
- Hover: border-rose/mauve, bg-rose/mauve/5
- Content: Centered flex column
  - Plus icon: 48px, text-gray-400
  - Text: "Create New Space" (font-medium)
  - Subtext: "Start a new product workflow" (text-sm text-gray-500)

**Recent Activity Section:**
- Below grid: mt-12
- Header: "Recent Activity" (text-xl font-semibold mb-4)
- List container: bg-white rounded-xl p-6 shadow-sm
- Activity items: flex items-start gap-3 py-3 border-b last:border-0
  - Icon: 32px circle with activity icon
  - Content: text-sm
  - Timestamp: text-xs text-gray-500

**Create Space Modal:**

Trigger: Click on "Create Space" card

Modal Overlay:
- Fixed inset-0
- Background: rgba(0, 0, 0, 0.5) with backdrop-blur-sm
- Z-index: 50

Modal Container:
- Centered: flex items-center justify-center
- Max width: 600px (max-w-xl)
- Padding: p-4 (for mobile spacing)

Modal Box:
- Background: White
- Rounded: rounded-2xl
- Shadow: shadow-xl
- Padding: p-8

Modal Header:
- Flex: justify-between items-start
- Title: "Create New Product Space" (text-xl font-semibold)
- Close button: Top right, rounded-lg p-2 hover:bg-gray-100

Modal Content:
- Margin top: mt-6
- Form fields with proper spacing

Form Structure:

1. Space Name Field:
   - Label: "Space Name" (text-sm font-medium mb-2)
   - Input: Full width text input
   - Placeholder: "E.g., Mobile App Redesign"
   - Margin bottom: mb-6

2. Problem Statement Field:
   - Label: "Problem Statement" (text-sm font-medium mb-2)
   - Helper text: "Describe the problem you want to solve" (text-xs text-gray-500 mb-2)
   - Textarea: h-32 (120px height)
   - Placeholder: "Our users are experiencing difficulties with..."
   - Character counter: bottom right, text-xs text-gray-500
   - Margin bottom: mb-6

Modal Footer:
- Flex: justify-end gap-3
- Margin top: mt-8
- Border top: pt-6 border-t

Buttons:
- Cancel: Secondary/ghost style, "Cancel"
- Create: Primary rose/mauve style, "Create Space →" with arrow icon
- Create button disabled if form invalid (name empty or problem < 10 chars)

**State Management for Dashboard:**

Loading state:
- Show skeleton cards while fetching spaces
- 6 skeleton cards in grid
- Pulsing animation

Empty state (no spaces yet):
- Centered in main content area
- Large icon (folder plus icon, 64px)
- Heading: "No spaces yet"
- Description: "Create your first product space to get started"
- Primary button: "Create Space"

Error state:
- Error banner at top of page
- Red background with white text
- Retry button on the right
- Dismissible

---

### Page 2: Space Workflow (/space/[id])

**Layout Structure:**

This page uses a two-panel layout with a fixed left sidebar and scrollable right content.

**Left Sidebar (Agent Steps Panel):**

Dimensions & Styling:
- Width: 240px fixed
- Height: Full viewport height minus top nav
- Background: White
- Border right: 1px solid #E5E5E5
- Padding: p-6
- Position: Sticky if needed for scroll behavior

Sidebar Header:
- Back button: Arrow left icon + "Back to Dashboard" text
- Text: text-sm text-gray-600
- Hover: text-rose/mauve
- Margin bottom: mb-8

Sidebar Content:
- Title: "Workflow Steps" (text-sm font-semibold text-gray-900 mb-4)

Agent Step List:
- Stack vertically with mb-3 spacing
- 4 steps total: Solution, Story, Email, RICE

Each Step Item Structure:
- Container: flex items-center gap-3 p-3 rounded-lg
- Cursor: pointer if accessible, not-allowed if locked
- Transition: all 200ms ease

Step Number Circle:
- Size: 32px (w-8 h-8)
- Rounded: rounded-full
- Display: flex items-center justify-center
- Font: text-sm font-semibold

Step Text:
- Step name: text-sm font-medium
- Step description: text-xs text-gray-500 (only for active step)

Step States (Visual Specifications):

**Active Step:**
- Background: rgba(155, 107, 122, 0.08)
- Number circle: bg-rose/mauve (#9B6B7A), text white
- Text: text-gray-900
- Border left: 3px solid #9B6B7A

**Completed Step:**
- Background: transparent
- Number circle: bg-green-500, white checkmark icon (size 16px)
- Text: text-gray-600
- Clickable: Can navigate back to review
- Hover: bg-gray-50

**Upcoming/Locked Step:**
- Background: transparent
- Number circle: border 2px solid #E5E5E5, text #9CA3AF, no background
- Text: text-gray-400
- Cursor: not-allowed
- Opacity: 60%

**Right Content Area:**

Dimensions & Layout:
- Flex: 1 (takes remaining space)
- Padding: p-8 or p-12 for more spacious layouts
- Background: #F5F5F7
- Min height: full viewport

Content Container:
- Max width: 900px (max-w-4xl)
- Margin: mx-auto for centering
- Background: White
- Rounded: rounded-xl
- Shadow: shadow-sm
- Padding: p-8

**Content Area Header:**

Structure:
- Margin bottom: mb-8
- Padding bottom: pb-6
- Border bottom: 1px solid #E5E5E5

Agent Title:
- Text: text-2xl font-semibold text-gray-900
- Example: "Solution Generator" or "Story Agent"

Agent Description:
- Text: text-sm text-gray-600 mt-2
- Example: "Our AI will analyze your problem and generate multiple solution approaches"

Progress Indicator:
- Text: text-xs text-gray-500
- Format: "Step 1 of 4"
- Position: Absolute top right or below description

**Content Area Body:**

This area changes based on which agent is active. General patterns:

Section Spacing:
- Sections separated by mb-8
- Each section in a card if it contains interactive elements
- Use dividers (border-t border-gray-200) sparingly

Form Fields:
- Follow input field patterns defined earlier
- Labels above inputs
- Helper text below labels
- Error messages below inputs in red

Read-Only Display Fields:
- Background: #FAFAFA
- Border: 1px solid #E5E5E5
- Padding: p-4
- Rounded: rounded-lg
- Text: text-sm text-gray-700

Action Buttons Container:
- Fixed to bottom of content area OR
- Sticky to bottom of viewport
- Background: White
- Border top: 1px solid #E5E5E5
- Padding: p-6
- Shadow: shadow-md if sticky
- Flex: justify-between items-center

Navigation Buttons:
- Left: "← Previous" or "← Back to Dashboard" (secondary style)
- Right: "Continue →" or "Next Step →" (primary rose/mauve style)
- Right button disabled until required actions complete

---

### Agent 1: Solution Agent UI

**Examine the API Route First:**
Look at the solution agent API route to understand:
- What it expects in the request (likely just problem statement and space ID)
- What structure the response has (title, summary, solutions array)
- What each solution object contains (id, title, description, etc.)

**UI Layout:**

Section 1: Problem Statement Display (Read-Only)
- Header: "Your Problem Statement" (text-base font-semibold mb-3)
- Content box: Follows read-only field pattern
- Text: Display the problem statement from the space
- Icon: Document icon on the left (20px)

Section 2: AI Generation Trigger
- If solutions haven't been generated yet:
  - Button: "Generate Solutions" (primary style, full width or centered)
  - Icon: Sparkles icon before text
  - Loading state: Button shows spinner + "Generating..." text
  - Disable button during generation

Section 3: Generated Title & Summary
- Only visible after generation
- Margin top: mt-8

Title Display:
- Label: "Suggested Title" (text-sm font-medium text-gray-700 mb-2)
- Content: text-xl font-semibold text-gray-900
- Background: Very light rose tint
- Padding: p-4
- Rounded: rounded-lg
- Margin bottom: mb-6

Summary Display:
- Label: "Executive Summary" (text-sm font-medium text-gray-700 mb-2)
- Content: text-sm text-gray-700 leading-relaxed
- Background: #FAFAFA
- Padding: p-4
- Rounded: rounded-lg
- Margin bottom: mb-8

Section 4: Solution Selection
- Header: "Proposed Solutions" (text-lg font-semibold mb-4)
- Subtext: "Select one solution to move forward with" (text-sm text-gray-600 mb-6)

Solution Cards (Radio Button Style):
- Layout: Stack vertically, gap-4
- Each solution is a card

**Solution Card Structure:**
- Container: Clickable card, acts as radio button
- Border: 2px solid #E5E5E5 (default)
- Border on hover: 2px solid #9B6B7A with lighter opacity
- Border when selected: 2px solid #9B6B7A
- Background: White (default), very light rose when selected
- Padding: p-5
- Rounded: rounded-xl
- Cursor: pointer
- Transition: all 200ms ease

Card Content:
- Radio indicator: Top left
  - Size: 20px
  - Border: 2px solid gray (unselected) or filled rose (selected)
  - Position: Absolute top-4 left-5

- Solution number badge: Top right
  - Text: "Solution 1", "Solution 2", etc.
  - Style: badge pattern with gray background
  - Font: text-xs font-medium

- Solution title:
  - Text: text-base font-semibold text-gray-900
  - Margin: mt-6 mb-3

- Solution description:
  - Text: text-sm text-gray-600 leading-relaxed
  - Line clamp: line-clamp-3 with "Read more" expansion option

- Expand/Collapse button:
  - Text: "Read more" / "Show less"
  - Style: Text button with rose/mauve color
  - Icon: ChevronDown / ChevronUp
  - Position: Bottom right

**Regenerate Option:**
- Three-dot menu button: Top right of section
- Dropdown menu with "Regenerate solutions" option
- Confirmation dialog before regenerating

**Navigation Buttons:**
- Previous: Disabled (this is step 1)
- Continue: Enabled only when a solution is selected
- Continue button text: "Select & Continue →"

**Loading State:**
During AI generation:
- Show spinner overlay on content area
- Text: "Our AI is analyzing your problem..."
- Progress dots or pulse animation
- Disable all interactions

**Error State:**
If generation fails:
- Error message card
- Icon: AlertCircle in red
- Message: "Failed to generate solutions. Please try again."
- Retry button

---

### Agent 2: Story Agent UI

**Examine the API Route First:**
Look at the story agent API route to understand:
- What it expects (likely space ID, selected solution)
- What persona structure it returns
- What fields are in the persona object

**UI Layout:**

Section 1: Selected Solution Display (Read-Only)
- Header: "Selected Solution" (text-base font-semibold mb-3)
- Card with read-only pattern
- Show the solution title and description that was selected
- Margin bottom: mb-8

Section 2: Persona Generation
- If persona not generated yet:
  - Button: "Generate User Persona" (primary style)
  - Icon: User icon with sparkles
  - Full width or centered
  - Loading state during generation

Section 3: User Persona Card
- Only visible after generation
- Special card with more visual styling

**Persona Card Structure:**
- Container: White background, shadow-md, rounded-xl
- Padding: p-8
- Max width: 700px, centered

Persona Header:
- Avatar section:
  - Large avatar: 80px (w-20 h-20)
  - Background: Gradient or solid rose/mauve
  - Initials: White text, text-2xl font-bold
  - Or use user icon if no name yet
  - Position: Left side

- Name & Role:
  - Name: text-2xl font-semibold text-gray-900
  - Role: text-base text-gray-600
  - Position: Next to avatar
  - Age: text-sm text-gray-500

- Tech Savviness Indicator:
  - Label: "Tech Savviness" (text-xs text-gray-500)
  - Star rating: 5 stars, filled based on level
  - Stars: 16px each, gap-1
  - Filled: text-yellow-400
  - Empty: text-gray-300

Divider:
- Margin: my-6
- Border: border-t border-gray-200

Persona Sections:
- Each section has consistent spacing: mb-6

**Background Section:**
- Label: "Background" (text-sm font-semibold text-gray-900 mb-2)
- Content: text-sm text-gray-700 leading-relaxed
- Multiple paragraphs if needed
- Line height: leading-relaxed

**Goals Section:**
- Label: "Goals & Motivations" (text-sm font-semibold text-gray-900 mb-3)
- List: Bulleted list with gap-2
- Each item:
  - Flex layout with checkmark icon
  - Icon: 16px, text-green-500
  - Text: text-sm text-gray-700
  - Gap: gap-2

**Pain Points Section:**
- Label: "Pain Points & Frustrations" (text-sm font-semibold text-gray-900 mb-3)
- List: Bulleted list with gap-2
- Each item:
  - Flex layout with X icon or alert icon
  - Icon: 16px, text-red-500
  - Text: text-sm text-gray-700
  - Gap: gap-2

**Additional Attributes:**
Display any other fields returned by the agent using similar patterns:
- Quote section if present
- Behaviors if present
- Preferences if present

**Regenerate Option:**
- Button: "Regenerate Persona" (secondary style)
- Position: Below persona card
- Icon: RefreshCw
- Confirmation: "This will create a new persona. Continue?"

**Navigation Buttons:**
- Previous: Enabled, goes back to Solution agent
- Continue: "Continue to Email Campaign →"
- Continue enabled once persona is generated

**Loading State:**
During persona generation:
- Skeleton layout of persona card
- Pulsing animation
- Text: "Creating user persona..."

---

### Agent 3: Email Agent UI

**Examine the API Routes First:**
Look at both email generation and email sending routes to understand:
- What user data is needed (email, role)
- How email content is generated and stored
- What the send endpoint expects
- How to track sent status

**UI Layout:**

Section 1: Selected Solution Summary (Read-Only)
- Compact card showing solution title
- Collapsed by default with expand option
- Margin bottom: mb-8

Section 2: Target Users Management
- Header: "Add Target Users" (text-lg font-semibold mb-4)
- Description: "Add stakeholders who should receive information about this solution" (text-sm text-gray-600 mb-6)

**Add User Form:**
- Container: Background #FAFAFA, p-4, rounded-lg, mb-6
- Layout: Grid with 2 columns on desktop, 1 on mobile

User Form Fields:
- Email input:
  - Label: "Email Address"
  - Type: email with validation
  - Placeholder: "john.doe@company.com"
  - Icon: Mail icon inside input on left

- Role input:
  - Label: "Role / Department"
  - Type: text or dropdown (if predefined roles)
  - Placeholder: "Product Manager"
  - Icon: Briefcase icon

- Add button:
  - Style: Secondary, icon-only or with text
  - Icon: Plus icon
  - Position: Aligned with inputs OR below on mobile
  - Text: "+ Add User"

**User List:**
- Container: Stack vertically, gap-3
- Each user is a card

**User Card Structure:**
- Border: 1px solid #E5E5E5
- Background: White
- Padding: p-4
- Rounded: rounded-lg
- Flex layout: justify-between items-start

User Card Content:
- Left section:
  - Avatar: 40px with initials
  - Name section:
    - Email: text-sm font-medium text-gray-900
    - Role: text-xs text-gray-600

- Right section:
  - Status badge (after generation):
    - "Generated" - blue badge
    - "Sent" - green badge with checkmark
    - "Failed" - red badge
  - Action buttons:
    - Preview button: Eye icon, text-gray-600
    - Remove button: Trash icon, text-red-600
    - Gap: gap-2

Section 3: Email Generation & Preview
- Margin top: mt-8
- Border top: pt-8 border-t border-gray-200

Generate Emails Button:
- Text: "Generate Personalized Emails"
- Style: Primary button, full width
- Icon: Sparkles + Mail icons
- Enabled: Only if users list has at least one user
- Loading state: "Generating emails..."

**Email Preview Section:**
- Only visible after generation
- Margin top: mt-6

Preview Container:
- Tabs or accordion for each user's email
- Tab style: Secondary tabs with user's name
- Active tab: Border bottom in rose/mauve

**Email Preview Card:**
- Background: White
- Border: 1px solid #E5E5E5
- Padding: p-6
- Rounded: rounded-lg

Email Content Layout:
- To field:
  - Label: "To:" (font-semibold)
  - Value: User's email and role
  - Text: text-sm text-gray-600

- Subject line:
  - Label: "Subject:" (font-semibold)
  - Value: Generated subject
  - Text: text-sm text-gray-900
  - Margin: my-4

- Divider

- Email body:
  - Background: #FAFAFA
  - Padding: p-4
  - Rounded: rounded-md
  - Text: text-sm text-gray-700 leading-relaxed
  - Preserve formatting (paragraphs)
  - Max height: max-h-96 with scroll if long

- Edit button:
  - Position: Top right of preview card
  - Icon: Edit icon
  - Opens textarea to edit email content

Section 4: Send Emails
- Margin top: mt-8

Send All Button:
- Text: "Send All Emails"
- Style: Primary button with prominent styling
- Icon: Send icon
- Full width
- Confirmation dialog before sending
- Progress indicator during send

Confirmation Dialog:
- Title: "Send Emails?"
- Message: "You are about to send personalized emails to X recipients. This cannot be undone."
- Buttons: "Cancel" and "Send Emails"

**Sending Progress:**
- Modal overlay showing progress
- List of users with status:
  - Pending: Gray circle
  - Sending: Spinner
  - Sent: Green checkmark
  - Failed: Red X with error message
- Overall progress bar at top

**Post-Send State:**
- Success message banner
- All user cards show "Sent" badge
- Email previews become read-only
- Option to "Send to Additional Users"

**Navigation Buttons:**
- Previous: Goes back to Story agent
- Continue: "Continue to RICE Analysis →"
- Continue enabled after emails are sent

**Error Handling:**
- Individual email send failures:
  - Show error badge on user card
  - Error message: "Failed to send: [reason]"
  - Retry button for that specific user

- Generation failures:
  - Error message above form
  - "Failed to generate emails. Please try again."
  - Retry button

---

### Agent 4: RICE Agent UI

**Examine the API Route First:**
Look at the RICE agent API route to understand:
- What data it needs (likely space ID and selected solution)
- The structure of RICE analysis returned
- Format of reach, impact, confidence, effort
- How score is calculated
- Structure of stakeholder analysis

**UI Layout:**

Section 1: Solution Context (Read-Only)
- Compact card with solution title
- Margin bottom: mb-8

Section 2: Generate RICE Analysis
- If not generated yet:
  - Button: "Generate RICE Analysis"
  - Style: Primary, full width or centered
  - Icon: BarChart icon with sparkles
  - Loading: "Analyzing solution..."

Section 3: RICE Breakdown
- Only visible after generation
- Grid layout: 2 columns on desktop, 1 on mobile
- Gap: gap-6
- Margin bottom: mb-8

**RICE Component Cards:**
Each of the 4 RICE components (Reach, Impact, Confidence, Effort) has its own card:

Card Structure:
- Background: White
- Border: 1px solid #E5E5E5
- Padding: p-6
- Rounded: rounded-xl
- Shadow: shadow-sm

Card Header:
- Title: text-lg font-semibold text-gray-900
- Icon: Relevant icon for each component (20px)
  - Reach: Users icon
  - Impact: TrendingUp icon
  - Confidence: Target icon
  - Effort: Clock icon
- Layout: flex items-center gap-2
- Margin bottom: mb-4

Card Content:
- Analysis text: text-sm text-gray-700 leading-relaxed
- Display the full explanation from the API
- Can be multiple paragraphs

**REACH Card:**
- Background accent: Very light blue tint
- Border left: 3px solid blue

**IMPACT Card:**
- Background accent: Very light green tint
- Border left: 3px solid green

**CONFIDENCE Card:**
- Background accent: Very light purple tint
- Border left: 3px solid purple

**EFFORT Card:**
- Background accent: Very light orange tint
- Border left: 3px solid orange

Section 4: RICE Score Display
- Margin top: mt-8
- Prominent display card

**Score Card Structure:**
- Background: Gradient from rose/mauve to slightly darker
- Text: White
- Padding: p-8
- Rounded: rounded-2xl
- Shadow: shadow-lg
- Text alignment: center

Score Display:
- Label: "RICE Score" (text-base font-medium opacity-90)
- Score: text-6xl font-bold
- Display score with one decimal place
- Margin: my-4

Priority Badge:
- Background: White with 20% opacity
- Text: White, font-semibold
- Padding: px-4 py-2
- Rounded: rounded-full
- Display priority level (High, Medium, Low)
- Center aligned

Score Interpretation:
- Text: text-sm opacity-90 mt-4
- Brief explanation of what the score means

Section 5: Stakeholder Impact Analysis
- Margin top: mt-8
- Header: "Stakeholder Impact Analysis" (text-xl font-semibold mb-6)

**Analysis Content Card:**
- Background: White
- Border: 1px solid #E5E5E5
- Padding: p-8
- Rounded: rounded-xl

Analysis Text:
- Text: text-sm text-gray-700 leading-relaxed
- Line height: leading-loose for easy reading
- Preserve paragraph breaks
- Can include bullet points if returned by agent

Section Highlights (if analysis includes them):
- Use subtle background highlights for different stakeholder groups
- Example: Executive section with light blue bg, Engineering with light orange bg
- Padding: p-3
- Rounded: rounded-md
- Margin: my-3

**Export & Complete Actions:**
- Margin top: mt-8
- Border top: pt-8 border-t

Export Button:
- Style: Secondary
- Text: "Export Full Report"
- Icon: Download icon
- Generates PDF or DOCX with all workflow data

Complete Workflow Button:
- Style: Primary rose/mauve
- Text: "Complete Workflow"
- Icon: CheckCircle
- Full width
- Confirmation dialog

Completion Dialog:
- Title: "Complete Workflow?"
- Message: "Marks this space as completed. You can still view and export the results."
- Buttons: "Cancel" and "Complete"

**Post-Completion State:**
- Success banner
- Badge on space: "Completed"
- All sections become read-only
- Option to "Create New Space"
- Option to "View Dashboard"

**Regenerate Option:**
- Three-dot menu at section top
- Option: "Regenerate RICE Analysis"
- Confirmation before regenerating

**Navigation Buttons:**
- Previous: Goes back to Email agent
- Continue: Changes to "Complete Workflow" (primary style with checkmark)

**Loading State:**
During analysis generation:
- Skeleton cards for RICE components
- Pulsing animations
- Text: "Analyzing solution impact..."
- Progress indicator

---

## Component Reusability Patterns

### Reusable Components to Build

Create these components once and reuse across agents:

**1. SectionCard Component:**
Props:
- title (string)
- description (optional string)
- icon (optional icon component)
- children (React nodes)
- actions (optional button group)
- className (for custom styling)

Usage: Wraps any content section with consistent styling

**2. FormField Component:**
Props:
- label (string)
- type (text, textarea, email, etc.)
- value (string)
- onChange (function)
- error (optional string)
- helperText (optional string)
- placeholder (string)
- icon (optional icon)
- required (boolean)

Usage: Consistent form inputs across all agents

**3. LoadingSpinner Component:**
Props:
- size (sm, md, lg)
- color (default to rose/mauve)
- text (optional loading message)

Usage: All loading states

**4. ErrorMessage Component:**
Props:
- message (string)
- onRetry (optional function)
- type (error, warning, info)

Usage: Consistent error displays

**5. Badge Component:**
Props:
- text (string)
- variant (success, warning, error, info, default)
- size (sm, md, lg)
- icon (optional)
- dot (optional boolean for dot indicator)

Usage: Status indicators throughout

**6. Button Component:**
Props:
- variant (primary, secondary, ghost, text)
- size (sm, md, lg)
- icon (optional)
- iconPosition (left, right)
- loading (boolean)
- disabled (boolean)
- onClick (function)
- children (text)

Usage: All buttons use this component

**7. Modal Component:**
Props:
- isOpen (boolean)
- onClose (function)
- title (string)
- children (React nodes)
- footer (optional React nodes)
- size (sm, md, lg, xl)

Usage: All modals/dialogs

**8. AgentHeader Component:**
Props:
- title (string)
- description (string)
- stepNumber (number)
- totalSteps (number)

Usage: Consistent header across all agents

**9. NavigationButtons Component:**
Props:
- onPrevious (function)
- onNext (function)
- previousDisabled (boolean)
- nextDisabled (boolean)
- previousText (optional string)
- nextText (optional string)

Usage: Bottom navigation in all agents

**10. ReadOnlyField Component:**
Props:
- label (string)
- value (string or React node)
- icon (optional)

Usage: Display read-only information consistently

---

## Responsive Design Specifications

### Breakpoint Strategy

Use Tailwind's default breakpoints:
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Desktop (1024px and above)

Dashboard:
- 3 columns for space cards
- Full top navigation
- All nav items visible

Space Workflow:
- Left sidebar: 240px fixed width, visible
- Content area: Flexible, centered max-w-4xl

Form layouts:
- 2 columns where appropriate (email form, RICE grid)
- Comfortable padding: p-8 to p-12

### Tablet (768px to 1023px)

Dashboard:
- 2 columns for space cards
- Simplified top navigation
- Search bar width reduced

Space Workflow:
- Left sidebar: Collapsible, opens as drawer
- Hamburger menu to toggle sidebar
- Content area: Full width with max-w-3xl
- Reduced padding: p-6

### Mobile (below 768px)

Dashboard:
- 1 column for space cards
- Minimal top navigation
- Search bar full width or collapsed to icon
- Hamburger menu for account options

Space Workflow:
- No visible sidebar by default
- Bottom navigation bar for agent steps
- Alternative: Step indicator dots at top
- Content area: Full width, p-4
- Forms: Single column
- Modals: Full screen or near full screen

**Bottom Navigation (Mobile):**
- Fixed to bottom
- Height: 64px
- Background: White
- Shadow: shadow-lg
- 4 buttons for 4 agents
- Active indicator: Rose/mauve color
- Icon + label for each step

---

## Animation & Transition Specifications

### General Principles
- Duration: 200ms for most interactions, 300ms for larger transitions
- Easing: ease-in-out for most, ease-out for exits
- Keep animations subtle and purposeful

### Specific Animations

**Page Transitions:**
```css
Fade in: opacity 0 to 1, 300ms ease-in-out
Slide in: translateX(20px) to 0, opacity 0 to 1, 300ms ease
```

**Card Hover:**
```css
Transform: translateY(-2px), 200ms ease
Shadow: shadow-sm to shadow-md, 200ms ease
```

**Button Interactions:**
```css
Hover: scale(1.02), 200ms ease
Active: scale(0.98), 100ms ease
```

**Modal:**
```css
Enter: scale(0.95) to 1, opacity 0 to 1, 200ms ease-out
Backdrop: opacity 0 to 1, 200ms ease
Exit: scale(1) to 0.95, opacity 1 to 0, 150ms ease-in
```

**Loading Spinner:**
```css
Rotation: 360deg, 1s linear infinite
```

**Progress Dots:**
```css
Pulse: opacity 100% to 50%, 2s ease-in-out infinite (for active dot)
```

**Form Field Focus:**
```css
Border color: 200ms ease
Ring shadow: 200ms ease
```

**Skeleton Loading:**
```css
Pulse: opacity 100% to 50%, 2s ease-in-out infinite
```

**Toast Notifications:**
```css
Enter: translateY(-100%) to 0, 300ms ease-out
Exit: translateY(-100%), 200ms ease-in
```

---

## State Management Strategy

### Context vs Zustand Decision

**Use React Context for:**
- UI state (modal open/closed, sidebar collapsed)
- Theme/styling preferences
- Current user session

**Use Zustand for:**
- Space data and CRUD operations
- Agent workflow state
- Form data across agents
- API call management

### Store Structure

**spaceStore:**
```
State:
- spaces: Array of space objects
- currentSpace: Currently selected space
- isLoading: Boolean
- error: Error object or null

Actions:
- fetchSpaces()
- createSpace(name, problemStatement)
- updateSpace(id, updates)
- deleteSpace(id)
- setCurrentSpace(space)
```

**agentStore:**
```
State:
- currentStep: Number (1-4)
- solutionData: Object with title, summary, solutions, selectedId
- storyData: Object with persona
- emailData: Object with users array, emails generated
- riceData: Object with RICE components and score
- isGenerating: Boolean
- error: Error object or null

Actions:
- setCurrentStep(step)
- generateSolution(problemStatement)
- selectSolution(solutionId)
- generatePersona(solution)
- addEmailUser(email, role)
- removeEmailUser(index)
- generateEmails()
- sendEmails()
- generateRICE()
- resetWorkflow()
- saveToMongoDB()
```

**uiStore:**
```
State:
- isCreateModalOpen: Boolean
- isSidebarOpen: Boolean (for mobile)
- notifications: Array
- activeTab: String

Actions:
- openCreateModal()
- closeCreateModal()
- toggleSidebar()
- addNotification(notification)
- removeNotification(id)
- setActiveTab(tab)
```

---

## API Integration Patterns

### Axios Configuration

Create an axios instance with:
- Base URL from environment variables
- Timeout: 30000 (30 seconds for AI operations)
- Headers: Content-Type application/json
- Interceptors for error handling and auth

### API Call Patterns

**Pattern for Agent API Calls:**

1. Set loading state to true
2. Disable form interactions
3. Make API call with try-catch
4. On success:
   - Parse response
   - Update store with data
   - Show success notification (if needed)
   - Enable next step
5. On error:
   - Set error state
   - Show error message
   - Provide retry option
6. Finally:
   - Set loading state to false
   - Re-enable interactions

**Example Flow for Solution Agent:**
```
User clicks "Generate Solutions"
→ Set isGenerating: true
→ POST to solution agent endpoint with { spaceId, problemStatement }
→ Response comes back with { title, summary, solutions: [...] }
→ Update solutionData in store
→ Set isGenerating: false
→ Render solutions in UI with selection interface
```

### Error Handling Strategy

**Network Errors:**
- Show: "Unable to connect. Please check your connection."
- Provide: Retry button
- Log error to console for debugging

**Validation Errors (400):**
- Show: Field-specific error messages
- Highlight: Invalid fields in red
- Focus: First invalid field

**Server Errors (500):**
- Show: "Something went wrong. Our team has been notified."
- Provide: Retry button or "Contact Support" link

**Timeout Errors:**
- Show: "Request is taking longer than expected..."
- Provide: Option to continue waiting or cancel

**Agent-Specific Errors:**
- Show context: "Failed to generate solutions" vs "Failed to send emails"
- Preserve user data: Don't clear form on error
- Allow: Retry without re-entering data

---

## MongoDB Integration Strategy

### Connection Setup

In Next.js API routes:
- Create a db connection utility
- Use connection pooling
- Handle connection errors gracefully
- Close connections properly

### Schema Creation Process

1. **Examine All Agent Routes First**
   - Read each route file completely
   - Document the response structure for each agent
   - Note all field names, types, and nesting

2. **Create Mongoose Models**
   - Create a Space model that includes:
     - Core space fields (name, problemStatement, dates)
     - Workflow state (currentStep, completed)
     - Nested objects for each agent's data
   - Use Mixed type for flexible agent data storage
   - Add proper indexes for querying

3. **Schema Evolution**
   - As agent outputs change, update schemas
   - Use default values for new fields
   - Maintain backward compatibility

### Data Persistence Strategy

**When to Save:**
- Immediately after space creation
- After each agent completes
- When user selects a solution
- When emails are sent
- On workflow completion

**What to Save:**
- All user inputs (problem statement, target users, etc.)
- All AI-generated content (solutions, persona, emails, RICE)
- User selections (which solution chosen)
- Workflow progress (current step)
- Timestamps (created, updated, completed)

**How to Save:**
- Use PUT endpoint to update space
- Include only changed fields in update
- Validate data before saving
- Handle save errors gracefully
- Show save status to user ("Saving...", "Saved")

### Data Retrieval Strategy

**On Dashboard Load:**
- Fetch all spaces from GET endpoint
- Sort by updatedAt (most recent first)
- Paginate if many spaces (10-20 per page)

**On Space Workflow Load:**
- Fetch single space by ID
- Load all agent data from the space
- Initialize store with saved data
- Navigate to currentStep

**Handling Incomplete Workflows:**
- If currentStep < 4 and agent data missing:
  - Allow user to regenerate that agent's data
  - Or continue from where they left off
- If currentStep > 1 but previous data missing:
  - Show error, require starting from beginning

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Provide width and height
- Use WebP format
- Lazy load below fold images

### Code Splitting
- Lazy load agent components
- Use dynamic imports for modals
- Split vendor bundles

### API Optimization
- Debounce auto-save (500ms)
- Cache space list (invalidate on mutation)
- Use SWR or React Query for data fetching
- Implement optimistic updates

### Rendering Optimization
- Memoize expensive components
- Use React.memo for pure components
- Optimize re-renders with proper key props
- Virtualize long lists (if needed)

---

## Security Considerations

### Input Validation
- Validate email format on frontend
- Sanitize user inputs before display
- Prevent XSS with proper escaping
- Validate on backend as well

### API Security
- Use environment variables for sensitive data
- Implement rate limiting on API routes
- Validate all inputs on backend
- Use HTTPS only

### Data Privacy
- Don't log sensitive data (emails, personal info)
- Follow MongoDB security best practices
- Implement proper error messages (don't leak info)

---

## Deployment Preparation

### Environment Variables
```
MONGODB_URI=
NEXT_PUBLIC_API_URL=
AI_API_KEY= (for agent generation)
SMTP_CONFIG= (for email sending)
```

### Build Optimization
- Run `next build` and check for warnings
- Optimize bundle size (check build output)
- Test production build locally
- Verify environment variables work

### Pre-Launch Checklist
- [ ] All routes return proper status codes
- [ ] Error boundaries catch errors
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Mobile responsive verified
- [ ] Performance metrics acceptable
- [ ] SEO meta tags added
- [ ] Analytics tracking added (if needed)

---

## Future Enhancement Considerations

Design with these in mind:
- Multi-user collaboration (space sharing)
- Real-time updates (WebSockets)
- Version history (tracking changes)
- Templates (pre-built problem statements)
- Integrations (Slack, Jira notifications)
- Advanced analytics (usage metrics)
- AI model selection (different models for agents)
- Custom agent configuration

---

## Summary Checklist for Implementation

When implementing this system, ensure:

1. **✅ Examine all API routes first** before building UI
2. **✅ Extract exact schemas** from route handlers
3. **✅ Design MongoDB models** based on agent outputs
4. **✅ Follow color system exactly** from screenshots
5. **✅ Implement all UI patterns consistently**
6. **✅ Build reusable components** to avoid duplication
7. **✅ Handle all error cases** gracefully
8. **✅ Make responsive** at all breakpoints

This implementation plan provides everything needed to build a production-ready product manager agent tools platform that matches the UI design exactly while integrating seamlessly with existing API routes and MongoDB storage.
