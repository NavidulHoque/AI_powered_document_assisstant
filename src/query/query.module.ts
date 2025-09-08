import { Global, Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';

@Global()
@Module({
  providers: [QueryService],
  exports: [QueryService],
  controllers: [QueryController]
})
export class QueryModule {}
