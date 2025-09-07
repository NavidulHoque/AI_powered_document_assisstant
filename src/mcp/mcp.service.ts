import { Injectable, OnModuleInit } from '@nestjs/common';
import { createMcpServer } from 'mcp-node';
import { QueryService } from '../query/query.service';
import { createSearchTool } from './tools/search.tool';

@Injectable()
export class McpService implements OnModuleInit {
  constructor(private queryService: QueryService) {}

  async onModuleInit() {
    const server = createMcpServer({
      tools: [createSearchTool(this.queryService)],
    });

    server.listen(4000); // MCP server port
    console.log('✅ MCP server running on port 4000');
  }
}
