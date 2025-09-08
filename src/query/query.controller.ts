import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { QueryService } from './query.service';
import { AuthGuard } from 'src/auth/guard';
import { IndexDocumentDto, SearchQueryDto } from './dto';

@Controller('query')
@UseGuards(AuthGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  /**
   * Index a new document for semantic search.
   */
  @Post('index')
  @HttpCode(200)
  indexDocument(@Body() dto: IndexDocumentDto) {
    return this.queryService.indexDocument(dto);
  }

  /**
   * Search documents semantically.
   */
  @Post('search')
  @HttpCode(200)
  async search(@Body() dto: SearchQueryDto) {
    return this.queryService.search(dto);
  }
}
