import { Module } from '@nestjs/common';
import { SalonService } from './salon.service';
import { PrismaService } from '../../database/prisma.service';
import { SalonController } from './salon.controller';

@Module({
  controllers: [SalonController],
  providers: [SalonService, PrismaService],
  exports: [SalonService],
})
export class SalonModule {}
