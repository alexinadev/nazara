import {
  IsNotEmpty,
  IsString,
  IsISO8601,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  salonId: string;

  @IsNotEmpty()
  staffId: string;

  @IsNotEmpty()
  @IsISO8601()
  scheduledAt: string;

  @IsNotEmpty()
  duration: number; // minutes

  @IsOptional()
  notes?: string;

  @IsOptional()
  discountCode?: string;
}
