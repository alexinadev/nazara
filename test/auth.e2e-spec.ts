import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);
  }, 20000);

  afterAll(async () => {
    await app.close();
  });

  it('request OTP and verify', async () => {
    const phone = '+999000111';
    await request(app.getHttpServer())
      .post('/auth/request-otp')
      .send({ phone })
      .expect(201);
    const otp = await prisma.oTP.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    const res = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phone, code: otp.code })
      .expect(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
