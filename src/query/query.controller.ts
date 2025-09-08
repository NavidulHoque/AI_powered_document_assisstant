import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { QueryService } from './query.service';
import { AuthGuard } from 'src/auth/guard';
import { SearchQueryDto } from './dto';

@Controller('query')
@UseGuards(AuthGuard)
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post('search')
  @HttpCode(200)
  async search(@Body() dto: SearchQueryDto) {
    return this.queryService.search(dto);
  }
}
