import { McpTool } from "mcp-node";
import { QueryService } from "src/query/query.service";

export function createSearchTool(queryService: QueryService): McpTool {
  return {
    name: "searchDocuments",
    description:
      "Search uploaded documents by semantic similarity and return relevant chunks with document metadata",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "User search query" },
        topK: { type: "number", description: "Max number of results", default: 5 },
      },
      required: ["query"],
    },
    async execute({ query, topK }) {
      // QueryService now already returns { id, score, snippet, document }
      return await queryService.search(query, topK ?? 5);
    },
  };
}
