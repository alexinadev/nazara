import { IsNotEmpty, IsPhoneNumber, IsOptional, IsIn } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsOptional()
  @IsIn(['customer', 'staff', 'admin'])
  role?: 'customer' | 'staff' | 'admin';
}
