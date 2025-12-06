// src/modules/auth/dto/refresh-token.dto.ts
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  refreshToken: string;
}
