import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Req,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { multerOptions } from 'src/cloudinary/multer.config';
import { User } from 'src/auth/decorators';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, multerOptions)) // allow up to 5 files
  upload(
    @UploadedFiles() files: Express.Multer.File[],
    @User("id") userId: string,
  ) {
    return this.documentService.uploadAndIndexFiles(files, userId);
  }
}
