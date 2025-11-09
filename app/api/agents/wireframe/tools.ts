import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

// Create the wireframe generator tool using LangGraph
export const createWireframeGeneratorTool = () => {
  return new DynamicStructuredTool({
    name: "wireframe_generator",
    description: "Generates an HTML wireframe page based on a user's idea or prompt. Creates a complete, styled HTML page with modern CSS that represents the wireframe of the concept.",
    schema: z.object({
      prompt: z.string().describe("The user's idea or description of what they want to create as a wireframe"),
    }),
    func: async ({ prompt }) => {
      try {
        const htmlWireframe = await generateWireframeWithLangGraph(prompt);
        return JSON.stringify({
          success: true,
          html: htmlWireframe,
          message: "HTML wireframe generated successfully"
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          message: "Failed to generate wireframe"
        });
      }
    },
  });
};

// Simplified wireframe generation (no LangGraph complexity needed)
async function generateWireframeWithLangGraph(userPrompt: string): Promise<string> {
  // Initialize the Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const systemPrompt = `You are an expert HTML/CSS developer. Create a complete, standalone HTML wireframe.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
1. Return ONLY raw HTML code - nothing else
2. Start with <!DOCTYPE html> and end with </html>
3. DO NOT wrap the HTML in markdown code blocks (\`\`\`html)
4. DO NOT include any explanations, comments outside the HTML, or text before/after the code
5. The first line must be: <!DOCTYPE html>
6. The last line must be: </html>

Technical Requirements:
- Complete HTML5 document
- All CSS must be embedded in <style> tags within <head>
- Use semantic HTML5 elements (header, nav, main, section, footer, etc.)
- Create a clean, minimalist wireframe design
- Use subtle borders, backgrounds (#f5f5f5, #e0e0e0), and shadows
- Modern color palette: grays, blues, whites
- Fully responsive layout using flexbox or CSS grid
- No external dependencies, frameworks, or CDN links
- Include minimal inline comments only within HTML/CSS

User Request: ${userPrompt}

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

// Export a simple API handler function
export async function generateWireframe(prompt: string): Promise<string> {
  return generateWireframeWithLangGraph(prompt);
}

// Example usage function for testing
export async function exampleUsage() {
  const tool = createWireframeGeneratorTool();

  const result = await tool.invoke({
    prompt: "Create a landing page for a SaaS product with a hero section, features grid, pricing table, and footer"
  });

  console.log(result);
  return result;
}
