import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString, IsEnum, IsString } from 'class-validator';

export class ListOrdersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page?: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  limit?: number | string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
