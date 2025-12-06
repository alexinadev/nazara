import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsOptional, IsIn } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsIn(['customer', 'staff', 'admin'])
  role?: 'customer' | 'staff' | 'admin';
}
