import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs/promises';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Processor('embedding-queue')
export class DocumentProcessor {
  private readonly logger = new Logger(DocumentProcessor.name);
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Process('upload')
  async handleUpload(job: Job<{ filePath: string; type: 'image' | 'video' }>) {
    const { filePath, type } = job.data;
    const publicId = `doc_${Date.now()}`;

    try {
      if (type === 'image') {
        await this.cloudinaryService.uploadImage(filePath, publicId, 'documents/images');
      } 
      
      else {
        await this.cloudinaryService.uploadVideo(filePath, publicId, 'documents/videos');
      }
    } 
    
    catch (error) {
      this.logger.error(`Upload failed for ${filePath}, Reason: ${error.message}`);
    } 
    
    finally {
      await fs.unlink(filePath).catch(() => null); 
    }
  }
}
