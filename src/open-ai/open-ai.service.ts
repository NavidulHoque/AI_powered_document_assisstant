import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly OPENAI_API_KEY: string | undefined;
  private client: OpenAI;

  constructor(private config: ConfigService) {
    this.OPENAI_API_KEY = this.config.get<string>('OPENAI_API_KEY');

    if (!this.OPENAI_API_KEY) {
      this.logger.error('Missing OPENAI_API_KEY');
      throw new InternalServerErrorException('OpenAI API key not configured');
    }

    this.client = new OpenAI({ apiKey: this.OPENAI_API_KEY });
  }

  async embedding(input: string) {
    try {
      const resp = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input,
      });
      return resp.data[0].embedding;
    } catch (e) {
      this.logger.error('embedding failed', (e as Error).stack);
      throw new InternalServerErrorException('OpenAI embedding failed');
    }
  }

  async chatCompletion(messages: ChatCompletionMessageParam[], model = 'gpt-4o-mini') {
    try {
      const resp = await this.client.chat.completions.create({
        model,
        messages,
      });
      return resp.choices?.[0]?.message?.content ?? '';
    } catch (e) {
      this.logger.error('chat completion failed', (e as Error).stack);
      throw new InternalServerErrorException('OpenAI chat completion failed');
    }
  }
}
