import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerOtpGuard extends ThrottlerGuard {
  protected getTracker(req: any, context: ExecutionContext): string {
    // throttle by phone for OTP endpoints
    try {
      const body = req.body;
      return body?.phone || super.getTracker(req, context);
    } catch {
      return super.getTracker(req, context);
    }
  }
}
