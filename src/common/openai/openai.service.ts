import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

const logger = new Logger('OpenAiService');

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.error('Missing OPENAI_API_KEY');
      throw new InternalServerErrorException('OpenAI API key not configured');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async embedding(input: string) {
    try {
      const resp = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input,
      });
      return resp.data[0].embedding;
    } catch (e) {
      logger.error('embedding failed', (e as Error).stack);
      throw new InternalServerErrorException('OpenAI embedding failed');
    }
  }

  async chatCompletion(messages: Array<{ role: string; content: string }>, model = 'gpt-4o-mini') {
    try {
      const resp = await this.client.chat.completions.create({
        model,
        messages,
      });
      return resp.choices?.[0]?.message?.content ?? '';
    } catch (e) {
      logger.error('chat completion failed', (e as Error).stack);
      throw new InternalServerErrorException('OpenAI chat completion failed');
    }
  }
}
