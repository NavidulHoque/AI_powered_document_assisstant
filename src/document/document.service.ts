import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
    private readonly openAi: OpenAiService,
  ) {}

  async uploadAndIndexFiles(files: Express.Multer.File[], userId: string) {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.all(
      files.map(file => this.uploadAndIndexFile(file, userId, file.originalname)),
    );

    return {
      message: 'Files uploaded and indexed successfully',
      documents: results.map(result => result.document),
      uploads: results.map(result => result.uploadResult),
    };
  }

  private async uploadAndIndexFile(file: Express.Multer.File, userId: string, title: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }

    try {
      // 1) Upload to Cloudinary
      const uploadResult = await this.cloudinary.upload(
        file.buffer,
        title, // use title as public_id
        'documents',
        'auto',
      );

      // 2) Extract text for embedding
      const textForEmbedding =
        file.mimetype?.startsWith('text')
          ? file.buffer.toString('utf8').slice(0, 20000)
          : `${title} ${uploadResult.secure_url}`;

      // 3) Create embedding
      const embedding = await this.openAi.embedding(textForEmbedding);

      // 4) Save Document in DB
      const document = await this.prisma.document.create({
        data: {
          title,
          userId,
          url: uploadResult.secure_url,
        },
      });

      // 5) Save chunk directly in DB 
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "Chunk" (id, content, embedding, "documentId") 
         VALUES (gen_random_uuid(), $1, $2, $3)`,
        textForEmbedding,
        embedding,
        document.id,
      );

      return { document, uploadResult };
    } 
    
    catch (error) {
      this.logger.error(
        `Failed to upload and index file, Reason: ${error.message}`,
        error.stack,
      );
      
      throw new InternalServerErrorException('Failed to upload and index file');
    }
  }
}
