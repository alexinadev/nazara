import { Test } from '@nestjs/testing';
import { AppointmentService } from '../appointement/appointement.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('AppointmentService (unit)', () => {
  let svc: AppointmentService;
  // let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppointmentService, PrismaService, NotificationService],
    }).compile();

    svc = module.get(AppointmentService);
    // prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(svc).toBeDefined();
  });
});
