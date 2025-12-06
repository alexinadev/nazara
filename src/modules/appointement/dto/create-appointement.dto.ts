import {
  IsNotEmpty,
  IsISO8601,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  salonId: string;

  @IsNotEmpty()
  @IsString()
  staffId: string;

  @IsNotEmpty()
  @IsISO8601()
  scheduledAt: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  discountCode?: string;
}
