import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Reviews (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let appointmentId: string;
  //   let customerId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);

    // create customer & appointment
    const phone = '+888000111';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone });
    const otp = await prisma.oTP.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    const login = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phone, code: otp.code });
    customerToken = login.body.data.accessToken;
    // customerId = login.body.data.user.id;

    // create staff and appointment
    const staffPhone = '+888000222';
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

    const salon = await prisma.salon.findFirst();
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        salonId: salon.id,
        staffId: staff.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        duration: 30,
      })
      .expect(201);

    appointmentId = res.body.data.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('post review', async () => {
    // fetch a criteria
    const crit = await prisma.reviewCriteria.findFirst();
    const payload = {
      appointmentId,
      rating: 4.5,
      comment: 'Great service',
      criteriaScores: [{ criteriaId: crit.id, score: 5 }],
    };

    const res = await request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.data.id).toBeDefined();
  }, 20000);
});
