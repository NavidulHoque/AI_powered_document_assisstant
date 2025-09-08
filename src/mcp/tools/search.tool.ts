import { McpTool } from "mcp-node";
import { QueryService } from "src/query/query.service";
import { SearchQueryDto } from "src/query/dto/search-query.dto";

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
      // Wrap into DTO to match QueryService signature
      const dto = new SearchQueryDto();
      dto.query = query;
      dto.topK = topK;

      return await queryService.search(dto);
    },
  };
}
