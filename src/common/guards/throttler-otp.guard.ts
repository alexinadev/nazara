import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerOtpGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    try {
      const body = req.body || {};
      // throttle by phone number if provided, otherwise fallback to IP
      return body.phone || super.getTracker(req);
    } catch {
      return super.getTracker(req);
    }
  }
  // protected getTracker(req: any, context: ExecutionContext): string {
  //   // throttle by phone for OTP endpoints
  //   try {
  //     const body = req.body;
  //     return body?.phone || super.getTracker(req, context);
  //   } catch {
  //     return super.getTracker(req, context);
  //   }
  // }
}
