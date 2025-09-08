import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { IVectorStore } from 'src/vector/ivectorstore.interface';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
    private readonly openAi: OpenAiService,
    @Inject('IVectorStore') private vectorStore: IVectorStore
  ) { }

  async uploadAndIndexFiles(
    files: Express.Multer.File[],
    userId: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.all(
      files.map(file =>
        this.uploadAndIndexFile(file, userId, file.originalname)
      ),
    );

    return {
      documents: results.map(result => result.document),
      uploads: results.map(result => result.uploadResult),
    };
  }

  private async uploadAndIndexFile(
    file: Express.Multer.File,
    userId: string,
    title: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }

    try {
      // 1) Upload to Cloudinary
      const uploadResult = await this.cloudinary.upload(
        file.buffer,           // file buffer
        title,                 // use title or original filename as public_id
        'documents',           // folder
        'auto',                // resource_type auto-detect
      );

      // 2) Extract text for embedding
      const textForEmbedding =
        (file.mimetype && file.mimetype.startsWith('text'))
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

      // 5) Index vector
      await this.vectorStore.index({
        id: document.id,
        embedding,
        metadata: { documentId: document.id, content: textForEmbedding },
      });

      return { document, uploadResult };
    }

    catch (error) {
      this.logger.error(`Failed to upload and index file, Reason: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload and index file');
    }
  }
}
