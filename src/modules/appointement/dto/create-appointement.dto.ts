import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsISO8601,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  salonId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  staffId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsISO8601()
  scheduledAt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  discountCode?: string;
}
