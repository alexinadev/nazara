import { IsNotEmpty, IsPhoneNumber, IsOptional, IsIn } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsIn(['customer', 'staff', 'admin'])
  role?: 'customer' | 'staff' | 'admin';
}
