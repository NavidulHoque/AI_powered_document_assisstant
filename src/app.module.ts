import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { QueryModule } from './query/query.module';
import { McpModule } from './mcp/mcp.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [AuthModule, PrismaModule, CloudinaryModule, QueryModule, McpModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
