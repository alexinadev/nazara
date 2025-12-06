import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/client.js';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
