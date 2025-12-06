<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Notes, assumptions, and design choices

- **Refresh tokens**: The Prisma schema didn't originally include a dedicated refresh token table. To keep with your provided model list, I reused DeviceToken to store hashed refresh tokens. For production you'd add a dedicated RefreshToken model with expiration and device metadata.

- **OTP storage**: Stored in OTP table, 5-minute expiry. Mock SMS provider logs to console.

- **Authorization**: Used JwtStrategy, RolesGuard, and @Roles decorator. JWT payload contains userId, userRole, and phone.

- **Throttling**: ThrottlerModule configured; ThrottlerOtpGuard throttles by phone.

- **Validation**: DTOs use class-validator. Global ValidationPipe is set.

- **Scheduling checks**: Appointment service checks overlapping appointments (basic approach comparing start/end intervals), staff day off, and not booking in the past.

- **Transactions**: Used Prisma transactions for atomic operations (payment/mark done).

- **Error handling**: All endpoints use HttpExceptionFilter.

- **Testing**: Provided e2e tests for OTP and appointment flows; unit test skeleton for AppointmentService.

- **Security**: helmet() applied, JWT secrets from env, refresh tokens hashed with bcrypt.

- **Cascading deletes**: Prisma schema uses onDelete: Cascade on relations where logical.

- **Indexes**: Prisma models have indexes for phone, date, status, and foreign keys as requested.

## First run

1. Create project, paste files into structure above.

2. ```npm install```

3. Configure ```.env``` from ```.env.example.```

4. ```npx prisma generate```

5. ```npx prisma migrate dev --name init```

6. ```node prisma/seed.ts``` (or ```ts-node prisma/seed.ts```) to seed default data

7. ```npm run start:dev```

## Final checklist

 - Full Prisma schema including models, enums, timestamps, relations, indexes
 - OTP login via phone (request + verify), mock SMS provider
 - JWT access + refresh (refresh tokens stored hashed)
 - Passport strategies (JWT + refresh)
 - Roles decorator & RolesGuard
 - ThrottlerGuard for OTP endpoints
 - Helmet for security
- CRUD controllers/services for main entities (Salon, Staff, Service, Appointment, Review, Gallery, Discount, Notification, Payment, Favorites)
- Appointment scheduling validation (overlap & day-off)
- Appointment workflow (create → cancel → done)
- Notifications (DB storage + mock)
- Reviews with multi-criteria scores
- Payment records (mock)
- Favorites, SearchHistory (model present)
- Unit & e2e tests (examples provided)
- Seed script
- Sample .env.example
- Enterprise-grade folder structure
- Use of Prisma transactions and consistent error handling

## Structure

```
nest-beauty-booking/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ common/
│  │  ├─ guards/
│  │  │  ├─ jwt-auth.guard.ts
│  │  │  ├─ roles.guard.ts
│  │  │  └─ throttler-otp.guard.ts
│  │  ├─ decorators/
│  │  │  ├─ roles.decorator.ts
│  │  │  └─ user.decorator.ts
│  │  ├─ filters/
│  │  │  └─ http-exception.filter.ts
│  │  ├─ interceptors/
│  │  │  └─ transform.interceptor.ts
│  │  └─ utils/
│  │     ├─ hash.ts
│  │     └─ sms.mock.ts
│  ├─ database/
│  │  └─ prisma.service.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ jwt.strategy.ts
│  │  │  ├─ refresh.strategy.ts
│  │  │  ├─ dto/
│  │  │  │  ├─ request-otp.dto.ts
│  │  │  │  └─ verify-otp.dto.ts
│  │  │  └─ controllers/
│  │  │     └─ auth.controller.ts
│  │  ├─ user/
│  │  │  ├─ user.module.ts
│  │  │  ├─ user.service.ts
│  │  │  ├─ controllers/
│  │  │  │  └─ user.controller.ts
│  │  │  └─ dto/
│  │  │     └─ update-user.dto.ts
│  │  ├─ salon/
│  │  │  ├─ salon.module.ts
│  │  │  ├─ salon.service.ts
│  │  │  ├─ salon.controller.ts
│  │  │  └─ dto/
│  │  │     ├─ create-salon.dto.ts
│  │  │     └─ update-salon.dto.ts
│  │  ├─ staff/
│  │  │  ├─ staff.module.ts
│  │  │  ├─ staff.service.ts
│  │  │  ├─ staff.controller.ts
│  │  │  └─ dto/
│  │  │     ├─ create-staff.dto.ts
│  │  │     └─ update-staff.dto.ts
│  │  ├─ services/
│  │  │  ├─ services.module.ts
│  │  │  ├─ services.service.ts
│  │  │  ├─ services.controller.ts
│  │  │  └─ dto/
│  │  │     ├─ create-service.dto.ts
│  │  │     └─ update-service.dto.ts
│  │  ├─ appointment/
│  │  │  ├─ appointment.module.ts
│  │  │  ├─ appointment.service.ts
│  │  │  ├─ appointment.controller.ts
│  │  │  └─ dto/
│  │  │     ├─ create-appointment.dto.ts
│  │  │     └─ update-appointment.dto.ts
│  │  ├─ review/
│  │  │  ├─ review.module.ts
│  │  │  ├─ review.service.ts
│  │  │  ├─ review.controller.ts
│  │  │  └─ dto/
│  │  │     └─ create-review.dto.ts
│  │  ├─ gallery/
│  │  │  ├─ gallery.module.ts
│  │  │  ├─ gallery.service.ts
│  │  │  └─ gallery.controller.ts
│  │  ├─ discount/
│  │  │  ├─ discount.module.ts
│  │  │  ├─ discount.service.ts
│  │  │  └─ discount.controller.ts
│  │  ├─ notification/
│  │  │  ├─ notification.module.ts
│  │  │  ├─ notification.service.ts
│  │  │  └─ notification.controller.ts
│  │  ├─ payment/
│  │  │  ├─ payment.module.ts
│  │  │  ├─ payment.service.ts
│  │  │  └─ payment.controller.ts
│  │  └─ favorites/
│  │     ├─ favorites.module.ts
│  │     ├─ favorites.service.ts
│  │     └─ favorites.controller.ts
│  └─ config/
│     └─ configuration.ts
├─ test/
│  ├─ auth.e2e-spec.ts
│  └─ appointment.e2e-spec.ts
├─ .env.example
├─ package.json
└─ tsconfig.json

```

## Fix

```
ThrottlerModule, Prisma, 
```
- All ```.service.ts```'s

## License

Nest is [MIT licensed](LICENSE).
