import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { IVectorStore } from 'src/vector/ivectorstore.interface';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndexDocumentDto, SearchQueryDto } from './dto';

type SearchResultItem = {
  id: string;               // chunk id
  score: number;            // similarity score
  snippet: string | null;   // short text from the matching chunk
  document: {               // minimal doc metadata
    id: string;
    title: string;
    url: string;
  } | null;
};

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private prisma: PrismaService,
    private openAi: OpenAiService,
    @Inject('IVectorStore') private vectorStore: IVectorStore,
  ) { }

  /**
   * Indexes a document: creates embeddings and stores metadata+vector.
   * Returns the created document record.
   */
  async indexDocument(dto: IndexDocumentDto) {
    const { documentId, userId, text, title, url } = dto;

    try {
      // 1) create embedding
      const embedding = await this.openAi.embedding(text);
      if (!embedding || !Array.isArray(embedding)) throw new Error('Empty embedding');

      // 2) create Document record (minimal schema: id, title, url, userId)
      const doc = await this.prisma.document.create({
        data: {
          id: documentId,
          userId,
          title: title ?? 'Untitled Document',
          url: url ?? '',
        },
      });

      // 3) index into vector store (store content + documentId in metadata)
      await this.vectorStore.index({
        id: doc.id, // note: underlying store generates a chunk id; this value isn't relied on
        embedding,
        metadata: { documentId: doc.id, content: text },
      });

      return { message: 'Document indexed successfully', document: doc };
    }

    catch (error) {
      this.logger.error(`Failed to index document, Reason: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to index document');
    }
  }

  /**
   * Search: returns top-k results with snippet + linked document metadata.
   * NOTE: Vector store returns CHUNK IDs; we resolve their parent documents here.
   */
  async search(dto: SearchQueryDto) {

    const { query, topK } = dto;
    
    try {
      const queryEmbedding = await this.openAi.embedding(query);
      const hits = await this.vectorStore.search({ embedding: queryEmbedding, topK });

      if (!hits.length) return [];

      // hits contain chunk IDs; fetch their document mapping
      const chunkIds = hits.map(h => h.id);

      const chunks = await this.prisma.chunk.findMany({
        where: { id: { in: chunkIds } },
        select: { id: true, documentId: true, content: true },
      });

      const chunkById = new Map(chunks.map(c => [c.id, c]));
      const docIds = Array.from(new Set(chunks.map(c => c.documentId)));

      const docs = docIds.length
        ? await this.prisma.document.findMany({
          where: { id: { in: docIds } },
          select: { id: true, title: true, url: true },
        })
        : [];

      const docById = new Map(docs.map(d => [d.id, d]));

      // Preserve ranking order from hits and shape as { id, score, snippet, document }
      const results: SearchResultItem[] = hits.map(h => {
        const chunk = chunkById.get(h.id);
        const doc = chunk ? docById.get(chunk.documentId) : null;

        return {
          id: h.id,
          score: h.score,
          // prefer vector-store-provided snippet; fall back to DB chunk content
          snippet: (h.metadata as any)?.content ?? chunk?.content ?? null,
          document: doc ? { id: doc.id, title: doc.title, url: doc.url } : null,
        };
      });

      return {
        message: 'Search successful',
        results
      };
    }

    catch (err) {
      this.logger.error('Search failed', (err as Error).stack);
      throw new InternalServerErrorException('Search failed');
    }
  }
}
