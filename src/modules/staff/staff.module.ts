import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { PrismaService } from '../../database/prisma.service';
import { StaffController } from './staff.controller';

@Module({
  controllers: [StaffController],
  providers: [StaffService, PrismaService],
  exports: [StaffService],
})
export class StaffModule {}
