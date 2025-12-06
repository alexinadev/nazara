import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsNotEmpty()
  code: string;

  role?: 'customer' | 'staff' | 'admin';
}
