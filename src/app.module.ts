import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { QueryModule } from './query/query.module';
import { McpModule } from './mcp/mcp.module';
import { DocumentModule } from './document/document.module';
import { OpenAiModule } from './open-ai/open-ai.module';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [AuthModule, PrismaModule, CloudinaryModule, QueryModule, McpModule, DocumentModule, OpenAiModule, VectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
