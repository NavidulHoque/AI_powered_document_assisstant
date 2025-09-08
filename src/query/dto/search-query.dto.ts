// src/query/dto/search-query.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';

export class SearchQueryDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  topK?: number;
}
