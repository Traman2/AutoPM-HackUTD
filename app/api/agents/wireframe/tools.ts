import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

// Page interface
export interface WireframePage {
  name: string;
  description: string;
  html: string;
}

// Zod schema for wireframe output
export const WireframePageSchema = z.object({
  name: z.string().describe("Name of the page (e.g., 'Landing Page', 'Dashboard', 'Login')"),
  description: z.string().describe("Brief description of what this page shows"),
  html: z.string().describe("Complete HTML code for the page"),
});

export const WireframeOutputSchema = z.object({
  pages: z.array(WireframePageSchema).describe("Array of wireframe pages for the product"),
});

// Create the wireframe generator tool using LangGraph
export const createWireframeGeneratorTool = () => {
  return new DynamicStructuredTool({
    name: "wireframe_generator",
    description: "Generates multiple HTML wireframe pages based on a product solution. Creates a complete set of styled HTML pages with modern CSS that represents key screens of the product.",
    schema: z.object({
      solution: z.string().describe("The product solution to create wireframes for"),
    }),
    func: async ({ solution }) => {
      try {
        const pages = await generateMultipleWireframes(solution);
        return JSON.stringify({
          success: true,
          pages,
          message: "HTML wireframes generated successfully"
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          message: "Failed to generate wireframes"
        });
      }
    },
  });
};

// Generate multiple wireframes for different pages
async function generateMultipleWireframes(solution: string): Promise<WireframePage[]> {
  console.log('[Wireframe Agent] Generating multiple pages for solution:', solution.substring(0, 100) + '...');

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // First, determine what pages are needed
  const planningPrompt = `You are a product designer. Based on this product solution, determine what key pages/screens should be wireframed.

SOLUTION:
${solution}

Return a JSON array of page objects, each with:
- name: string (e.g., "Landing Page", "Dashboard", "Login Page", "Settings")
- description: string (brief description of what this page shows)

Typical pages might include:
- Landing Page (marketing/public)
- Login/Signup Page
- Dashboard/Home (main authenticated view)
- Feature-specific pages (based on the solution)
- Settings/Profile page
- Admin panel (if applicable)

Return 3-5 pages that make sense for this product. Return ONLY valid JSON, no markdown, no explanations.

Example format:
[
  {"name": "Landing Page", "description": "Public marketing page showcasing the product"},
  {"name": "Dashboard", "description": "Main user interface after login"}
]`;

  const planningResponse = await model.invoke([new HumanMessage(planningPrompt)]);
  let planningContent = planningResponse.content as string;

  // Extract JSON from markdown code blocks if present
  const jsonMatch = planningContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (jsonMatch) {
    planningContent = jsonMatch[1];
  }

  let pagePlans: Array<{ name: string; description: string }>;
  try {
    pagePlans = JSON.parse(planningContent.trim());
    console.log('[Wireframe Agent] Planning to generate', pagePlans.length, 'pages');
  } catch (error) {
    console.error('[Wireframe Agent] Failed to parse page plans, using defaults');
    pagePlans = [
      { name: "Landing Page", description: "Public marketing page" },
      { name: "Login Page", description: "User authentication" },
      { name: "Dashboard", description: "Main user interface" },
    ];
  }

  // Generate HTML for each page
  const pages: WireframePage[] = [];
  for (const plan of pagePlans) {
    console.log(`[Wireframe Agent] Generating ${plan.name}...`);
    const html = await generateSingleWireframe(solution, plan.name, plan.description);
    pages.push({
      name: plan.name,
      description: plan.description,
      html,
    });
  }

  console.log('[Wireframe Agent] Successfully generated', pages.length, 'pages');
  return pages;
}

// Generate a single wireframe page
async function generateSingleWireframe(solution: string, pageName: string, pageDescription: string): Promise<string> {
  // Initialize the Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const systemPrompt = `You are an expert UI/UX designer and front-end developer specializing in creating beautiful, modern web designs. Create a stunning, fully-styled HTML wireframe for a specific page of a product.

PRODUCT SOLUTION:
${solution}

PAGE TO CREATE:
Name: ${pageName}
Description: ${pageDescription}

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
1. Return ONLY raw HTML code - nothing else
2. Start with <!DOCTYPE html> and end with </html>
3. DO NOT wrap the HTML in markdown code blocks (\`\`\`html)
4. DO NOT include any explanations, comments outside the HTML, or text before/after the code
5. The first line must be: <!DOCTYPE html>
6. The last line must be: </html>

DESIGN REQUIREMENTS - Create a BEAUTIFUL, MODERN design:

Visual Design:
- Use a sophisticated, modern color palette (not just grays!)
  * Primary: Beautiful blues (#3B82F6, #2563EB) or purples (#8B5CF6, #7C3AED)
  * Accent: Complementary colors for CTAs (#10B981, #F59E0B, #EF4444)
  * Backgrounds: Subtle gradients, soft colors (#F9FAFB, #EFF6FF, #F5F3FF)
  * Text: Proper hierarchy (#111827 for headings, #6B7280 for body)
- Use modern CSS features:
  * Subtle gradients for backgrounds and cards
  * Box shadows for depth (subtle: 0 1px 3px rgba(0,0,0,0.1), medium: 0 4px 6px rgba(0,0,0,0.1))
  * Border radius for rounded corners (8px, 12px, 16px)
  * Smooth transitions and hover effects
- Typography:
  * Use system font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
  * Clear hierarchy: h1 (36-48px), h2 (30-36px), h3 (24px), body (16px)
  * Proper line-height (1.6 for body, 1.2 for headings)
  * Font weights: 700 for headings, 600 for subheadings, 400 for body

Layout & Spacing:
- Generous whitespace and padding (sections: 80-120px vertical, cards: 32-48px)
- Use CSS Grid and Flexbox for modern, responsive layouts
- Container max-width: 1200px with auto margins for content pages, full width for dashboards
- Consistent spacing scale: 8px, 16px, 24px, 32px, 48px, 64px, 80px

Page-Specific Guidelines:

FOR LANDING PAGES:
- Hero section with gradient background and large, bold typography
- Feature grids with 2-4 columns and icons
- Testimonials with avatars
- Pricing tables (if relevant)
- Call-to-action sections
- Footer with multiple columns

FOR LOGIN/SIGNUP PAGES:
- Centered card with form fields
- Email and password inputs with proper styling
- Social login buttons (if relevant)
- Links to forgot password and sign up
- Minimal, focused design

FOR DASHBOARDS:
- Sidebar navigation (fixed left, ~240px)
- Top navigation bar with user profile
- Main content area with stats cards and charts placeholders
- Data tables with proper styling
- Action buttons and filters
- Use card-based layout for different sections

FOR SETTINGS/PROFILE PAGES:
- Two-column layout (navigation sidebar + content)
- Form sections with clear labels
- Toggle switches, dropdowns, and inputs
- Save/Cancel buttons
- Profile picture upload area

Modern Effects & Details:
- Add subtle hover effects (transform: translateY(-4px), increased shadows)
- Use transition: all 0.3s ease for smooth animations
- Add decorative elements (colored dots, lines, or shapes)
- Include subtle background patterns or gradients
- Make buttons and interactive elements stand out
- Use badge/tag components with small rounded backgrounds

Technical Requirements:
- Complete, valid HTML5 document
- All CSS embedded in <style> tags in <head>
- Semantic HTML5 (header, nav, main, section, article, footer)
- Fully responsive with mobile-first approach
- No external dependencies or CDN links
- Cross-browser compatible CSS
- Include realistic placeholder content relevant to the product solution

IMPORTANT: Make it VISUALLY STUNNING and contextually relevant to both the product solution and the specific page type. This should look like a modern, professional website from 2024/2025. Use colors, gradients, shadows, and spacing to create visual hierarchy and beauty. Think Stripe, Linear, Vercel, or Tailwind CSS showcase quality.

Remember: Output must start with <!DOCTYPE html> and contain NOTHING before or after the HTML code.`;

  const response = await model.invoke([new HumanMessage(systemPrompt)]);
  let htmlContent = response.content as string;

  // Try to extract HTML from markdown code blocks
  const codeBlockMatch = htmlContent.match(/```html\s*\n([\s\S]*?)\n```/) ||
                        htmlContent.match(/```\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    htmlContent = codeBlockMatch[1].trim();
  }

  // Try to extract just the DOCTYPE to </html> part
  const doctypeMatch = htmlContent.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
  if (doctypeMatch) {
    htmlContent = doctypeMatch[0];
  }

  // Clean up any remaining markdown or extra text
  htmlContent = htmlContent.trim();

  // If still doesn't start with DOCTYPE, wrap in basic HTML
  if (!htmlContent.toLowerCase().startsWith('<!doctype')) {
    console.warn('Generated content did not start with DOCTYPE, wrapping in basic HTML');
    htmlContent = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Wireframe</title>
                    </head>
                    <body>
                        <div style="padding: 20px; font-family: sans-serif;">
                            <h1>Error generating wireframe</h1>
                            <p>The AI did not return valid HTML. Please try again.</p>
                        </div>
                    </body>
                    </html>`;
  }

  return htmlContent;
}

// Export the main function
export async function generateWireframes(solution: string): Promise<WireframePage[]> {
  return generateMultipleWireframes(solution);
}

// Legacy function for backward compatibility
export async function generateWireframe(prompt: string): Promise<string> {
  const pages = await generateMultipleWireframes(prompt);
  return pages[0]?.html || '';
}

