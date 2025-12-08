import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsOptional, IsIn } from 'class-validator';

export class ResponseOtpDto {
  //{ phone, code, expiresAt }
  @ApiProperty({ example: '+989173770342' })
  phone: string = '';

  @ApiProperty({ example: '123456' })
  code: string = '';

  @ApiProperty({ example: 1633024800000 })
  expiresAt: number = 0;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+989173770342' })
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty({ example: 'customer' })
  @IsOptional()
  @IsIn(['customer', 'staff', 'admin'])
  role?: 'customer' | 'staff' | 'admin';
}
