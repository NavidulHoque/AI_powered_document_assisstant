import { Injectable } from '@nestjs/common';
import { createMcpServer } from 'mcp-node';
import { QueryService } from '../query/query.service';
import { createSearchTool } from './tools/search.tool';

@Injectable()
export class McpService {
  constructor(private queryService: QueryService) {}

  // create server factory but do not auto-listen from Nest
  createServer() {
    const server = createMcpServer({
      tools: [createSearchTool(this.queryService)],
    });
    return server;
  }
}
