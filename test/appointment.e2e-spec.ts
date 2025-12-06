import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Appointment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let customerId: string;
  let staffId: string;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);

    // create staff and customer & get tokens via OTP flow
    const staffPhone = '+777000111';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone: staffPhone, role: 'staff' });
    const staffOtp = await prisma.otp.findFirst({
      where: { phone: staffPhone },
      orderBy: { createdAt: 'desc' },
    });
    const staffLogin = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phone: staffPhone, code: staffOtp.code, role: 'staff' });
    const staff = await prisma.staff.findUnique({
      where: { phone: staffPhone },
    });
    staffId = staff.id;

    const customerPhone = '+777000222';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone: customerPhone, role: 'customer' });
    const custOtp = await prisma.otp.findFirst({
      where: { phone: customerPhone },
      orderBy: { createdAt: 'desc' },
    });
    const custLogin = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phone: customerPhone, code: custOtp.code });
    token = custLogin.body.data.accessToken;
    const customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and cancel appointment', async () => {
    const salon = await prisma.salon.findFirst();
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        salonId: salon.id,
        staffId,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        duration: 60,
      })
      .expect(201);

    const appointmentId = res.body.data.id;
    await request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
