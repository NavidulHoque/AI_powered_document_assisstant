import { McpTool } from "mcp-node";
import { QueryService } from "src/query/query.service";

export function createSearchTool(queryService: QueryService): McpTool {
  return {
    name: "searchDocuments",
    description: "Search uploaded documents for a query",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
    async execute({ query }) {
      return await queryService.search(query);
    },
  };
}
