import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
