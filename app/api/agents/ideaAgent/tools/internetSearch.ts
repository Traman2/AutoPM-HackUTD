import { TavilySearch } from "@langchain/tavily";

export const internetSearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
  includeAnswer: false,
  includeRawContent: false
});
