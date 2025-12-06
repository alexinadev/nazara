import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from 'src/generated/prisma/client.js';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
