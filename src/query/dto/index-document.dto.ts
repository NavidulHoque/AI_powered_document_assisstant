import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IndexDocumentDto {
  @IsOptional()
  @IsString()
  documentId?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  url?: string;
}