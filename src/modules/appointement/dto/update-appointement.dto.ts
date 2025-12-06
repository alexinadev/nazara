import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
