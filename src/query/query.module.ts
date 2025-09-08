import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { VectorModule } from 'src/vector/vector.module';

@Module({
  imports: [PrismaModule, OpenAiModule, VectorModule],
  providers: [QueryService],
  exports: [QueryService]
})
export class QueryModule {}
