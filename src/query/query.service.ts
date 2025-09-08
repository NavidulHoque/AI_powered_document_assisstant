// src/query/query.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchQueryDto } from './dto';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type SearchResultItem = {
  id: string;               // chunk id
  score: number;            // similarity score (0..1)
  snippet: string | null;   // text of the chunk
  document: {               // minimal doc metadata
    id: string;
    title: string;
    url: string;
  } | null;
};

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);
  private readonly MAX_CONTEXT_CHARS = 3000; // limit to keep prompts small

  constructor(
    private prisma: PrismaService,
    private openAi: OpenAiService,
  ) {}

  async search(dto: SearchQueryDto) {
    const { query, topK = 5 } = dto;

    try {
      // 1) Embed query
      const queryEmbedding = await this.openAi.embedding(query);

      // 2) Search chunks with pgvector
      const rawRows = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, content, embedding <-> $1 AS distance, "documentId"
         FROM "Chunk"
         ORDER BY distance ASC
         LIMIT $2`,
        queryEmbedding,
        topK,
      );

      if (!rawRows?.length) {
        return {
          message: 'No results found',
          results: [] as SearchResultItem[],
          answer: "I don't know based on the provided documents.",
        };
      }

      // 3) Fetch document metadata
      const docIds = Array.from(new Set(rawRows.map(r => r.documentId).filter(Boolean)));
      const docs = docIds.length
        ? await this.prisma.document.findMany({
            where: { id: { in: docIds } },
            select: { id: true, title: true, url: true },
          })
        : [];
      const docById = new Map(docs.map(d => [d.id, d]));

      // 4) Map search results
      const results: SearchResultItem[] = rawRows.map(r => {
        const doc = docById.get(r.documentId) ?? null;
        let score = 1 - (typeof r.distance === 'number' ? r.distance : 1);
        score = Math.max(0, Math.min(score, 1)); // clamp [0..1]

        return {
          id: r.id,
          score,
          snippet: typeof r.content === 'string' ? r.content : null,
          document: doc ? { id: doc.id, title: doc.title, url: doc.url } : null,
        };
      });

      // 5) Build context for AI
      let context = '';
      for (const res of results) {
        if (!res.snippet) continue;
        const part = `Source: ${res.document?.title ?? res.document?.id ?? 'unknown'}\n${res.snippet}\n\n---\n\n`;
        if ((context.length + part.length) > this.MAX_CONTEXT_CHARS) break;
        context += part;
      }
      if (!context) context = 'No relevant document snippets were found.';

      // 6) Call openai
      const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content:
          'You are a helpful assistant. Use ONLY the provided document snippets to answer. ' +
          'If the answer is not in the snippets, say "I don\'t know based on the provided documents."',
      };
      const userMessage: ChatCompletionMessageParam = {
        role: 'user',
        content: `Question: ${query}\n\nContext:\n${context}\n\nAnswer clearly and concisely, citing source titles when relevant.`,
      };

      const answer = await this.openAi.chatCompletion([systemMessage, userMessage]);

      return {
        message: 'Search successful',
        results,
        answer,
      };
    } 
    
    catch (err) {
      this.logger.error('Search failed', (err as Error).stack);
      throw new InternalServerErrorException('Search failed');
    }
  }
}
