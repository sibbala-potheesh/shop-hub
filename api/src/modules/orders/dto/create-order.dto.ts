import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  Min,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

class ShippingAddressDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '123 Main St' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Metropolis' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  zipcode: string;

  @ApiProperty({ example: 'USA' })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '+15551234567' })
  @IsNotEmpty()
  phoneNumber: string;
}

class ItemDto {
  @ApiProperty({ example: '60df1f1b1f1b1f1b1f1b1f1b' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Premium Wireless Headphones' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ enum: ['CreditCard', 'PayPal', 'ApplePay', 'GooglePay'] })
  @IsEnum(['CreditCard', 'PayPal', 'ApplePay', 'GooglePay'])
  paymentMethod: 'CreditCard' | 'PayPal' | 'ApplePay' | 'GooglePay';

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  subtotal?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  shipping?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  tax?: number;

  // total is computed on server
}
