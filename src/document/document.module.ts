import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { VectorModule } from 'src/vector/vector.module';

@Module({
  imports: [
    CloudinaryModule,
    PrismaModule,
    OpenAiModule,
    VectorModule
  ],
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule { }
