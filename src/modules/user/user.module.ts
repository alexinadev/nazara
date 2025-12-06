import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { UserController } from './controllers/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
