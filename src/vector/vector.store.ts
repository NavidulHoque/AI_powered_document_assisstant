import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IVectorStore, VectorIndexItem, VectorSearchResult } from 'src/vector/ivectorstore.interface';

@Injectable()
export class VectorStore implements IVectorStore {
  constructor(private prisma: PrismaService) {}

  /**
   * Index an embedding into Chunk
   */
  async index(item: VectorIndexItem): Promise<void> {
    const documentId = item.metadata?.documentId;
    const content = item.metadata?.content ?? '';

    if (!documentId) {
      throw new Error('documentId is required in metadata when indexing');
    }

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "Chunk" (id, content, embedding, "documentId") 
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      content,
      item.embedding,
      documentId,
    );
  }

  /**
   * Search similar chunks using pgvector `<->`
   */
  async search(options: { embedding: number[]; topK: number; filterId?: string }): Promise<VectorSearchResult[]> {
    const { embedding, topK, filterId } = options;

    const query = filterId
      ? `SELECT id, content, embedding <-> $1 AS distance
         FROM "Chunk"
         WHERE "documentId" = $2
         ORDER BY distance ASC
         LIMIT $3`
      : `SELECT id, content, embedding <-> $1 AS distance
         FROM "Chunk"
         ORDER BY distance ASC
         LIMIT $2`;

    const params = filterId ? [embedding, filterId, topK] : [embedding, topK];

    const result = await this.prisma.$queryRawUnsafe<any[]>(query, ...params);

    return result.map(r => ({
      id: r.id,
      score: 1 - r.distance, // distance is lower = more similar, so convert to score
      metadata: { content: r.content },
    }));
  }
}
