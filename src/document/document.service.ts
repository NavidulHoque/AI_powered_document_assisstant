import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { VectorStore } from 'src/common/vector/vector.store';

@Injectable()
export class DocumentService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private readonly vectorStore: VectorStore) {}

  async processDocument(text: string, docId: string) {
    const chunks = this.chunkText(text, 500); // split into 500 token chunks
    for (const chunk of chunks) {
      const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });
      await this.vectorStore.insertEmbedding(docId, chunk, embedding.data[0].embedding);
    }
    return { message: 'Document processed with AI embeddings' };
  }

  async answerQuestion(docId: string, question: string) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });

    const results = await this.vectorStore.search(docId, embedding.data[0].embedding, 3);

    const context = results.map(r => r.text).join('\n\n');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant answering based on provided documents.' },
        { role: 'user', content: `Question: ${question}\n\nContext:\n${context}` }
      ],
    });

    return { answer: response.choices[0].message.content, sources: results };
  }

  private chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }
}
