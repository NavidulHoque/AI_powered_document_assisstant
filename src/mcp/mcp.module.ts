import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { QueryModule } from '../query/query.module';

@Module({
  imports: [QueryModule],
  providers: [McpService],
})
export class McpModule {}
