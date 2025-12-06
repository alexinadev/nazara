import { Test } from '@nestjs/testing';
import { AppointmentService } from './appointement.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ConflictException } from '@nestjs/common';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppointmentService, PrismaService, NotificationService],
    }).compile();
    service = module.get(AppointmentService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Additional unit tests would mock prisma calls and verify logic.
});
