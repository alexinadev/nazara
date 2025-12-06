import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Appointment flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let staffId: string;
  let salonId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);

    // ensure salon exists (seed should have created)
    const salon = (await prisma.salon.findFirst())!;
    salonId = salon.id;

    // create staff via OTP
    const staffPhone = '+777000111';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone: staffPhone, role: 'staff' });
    // const staffOtp = await prisma.oTP.findFirst({
    //   where: { phone: staffPhone },
    //   orderBy: { createdAt: 'desc' },
    // });
    // const staffLogin = await request(app.getHttpServer())
    //   .post('/auth/verify-otp')
    //   .send({ phone: staffPhone, code: staffOtp.code, role: 'staff' });
    const staff = await prisma.staff.findUnique({
      where: { phone: staffPhone },
    });
    staffId = staff.id;

    // create customer and get token
    const custPhone = '+777000222';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone: custPhone });
    const custOtp = await prisma.oTP.findFirst({
      where: { phone: custPhone },
      orderBy: { createdAt: 'desc' },
    });
    const custLogin = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phone: custPhone, code: custOtp.code });
    customerToken = custLogin.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('create + cancel appointment', async () => {
    const scheduledAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        salonId,
        staffId,
        scheduledAt,
        duration: 60,
      })
      .expect(201);

    const ap = res.body.data;
    expect(ap.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/appointments/${ap.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
  }, 20000);
});
