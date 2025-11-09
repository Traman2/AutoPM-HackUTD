import { tool } from "@langchain/core/tools";
import { z } from "zod";

const internetSearchSchema = z.object({
  query: z.string().describe("The search query to look up on the internet"),
});

export const internetSearchTool = tool(
  async ({ query }) => {
    try {
      // Using DuckDuckGo search via their instant answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );
      const data = await response.json();

      // Format the search results
      let results = "";

      if (data.AbstractText) {
        results += `Summary: ${data.AbstractText}\n\n`;
      }

      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        results += "Related Information:\n";
        data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
          if (topic.Text) {
            results += `${index + 1}. ${topic.Text}\n`;
          }
        });
      }

      return results || `No detailed results found for: ${query}. Try refining your search.`;
    } catch (error) {
      return `Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "internet_search",
    description: "Search the internet for information using DuckDuckGo. Use this when you need current information or research about a topic.",
    schema: internetSearchSchema,
  }
);
