import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsOptional, IsIn } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class VerifyOtpResponseDto {
  @ApiProperty({ example: 'access-token' })
  accessToken: string = '';

  @ApiProperty({ example: 'refresh-token' })
  refreshToken: string = '';

  @ApiProperty({ example: 'customer' })
  user: { id: string; role: Role ; phone: string }
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+989173770342' })
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'customer' })
  @IsOptional()
  @IsIn(['customer', 'staff', 'admin'])
  role?: 'customer' | 'staff' | 'admin';
}
