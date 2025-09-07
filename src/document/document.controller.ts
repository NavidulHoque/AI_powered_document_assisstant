import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { multerOptions } from 'src/cloudinary/multer.config';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 2, multerOptions))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    for (const file of files) {
      const type = file.mimetype.startsWith('video') ? 'video' : 'image';
      await this.documentService.enqueueUploadJob(file.path, type);
    }
    return { message: 'Files queued for processing' };
  }
}
