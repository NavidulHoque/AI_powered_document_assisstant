import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QueryService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    // Get query embedding
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Find similar chunks using pgvector cosine similarity
    const chunks = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT content
      FROM "Chunk"
      ORDER BY embedding <=> '[${embedding.data[0].embedding.join(',')}]'
      LIMIT 5;
    `);

    // Use retrieved chunks in RAG
    const context = chunks.map(c => c.content).join('\n');
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful document assistant.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
      ],
    });

    return completion.choices[0].message.content;
  }
}
