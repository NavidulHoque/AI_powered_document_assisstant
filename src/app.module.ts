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
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // makes ConfigService global
    }),
    JwtModule.register({
      global: true,    // makes jwtService global
    }),
    AuthModule,
    PrismaModule,
    CloudinaryModule,
    QueryModule,
    McpModule,
    DocumentModule,
    OpenAiModule,
    VectorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
