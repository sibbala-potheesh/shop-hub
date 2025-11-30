import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class ListProductsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number | string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: number | string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  minPrice?: number | string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  maxPrice?: number | string;

  @ApiPropertyOptional({ example: 'headphone' })
  @IsOptional()
  @IsString()
  q?: string;
}
