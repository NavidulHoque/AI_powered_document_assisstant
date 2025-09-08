import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class SearchQueryDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  topK: number;
}