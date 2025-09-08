import { Global, Module } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';

@Global()
@Module({
  providers: [OpenAiService],
  exports: [OpenAiService]
})
export class OpenAiModule {}
