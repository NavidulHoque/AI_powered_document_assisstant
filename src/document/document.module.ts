import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { BullModule } from '@nestjs/bull';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { DocumentProcessor } from './processors/document.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'embedding-queue',
    }),
    CloudinaryModule
  ],
  providers: [DocumentService, DocumentProcessor],
  controllers: [DocumentController]
})
export class DocumentModule { }
