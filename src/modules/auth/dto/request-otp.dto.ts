import { IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  // optional role to create user type
  role?: 'customer' | 'staff' | 'admin';
}
