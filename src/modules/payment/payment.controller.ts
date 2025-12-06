import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private svc: PaymentService) {}

  @Post()
  pay(
    @Body()
    body: {
      appointmentId: string;
      amount: number;
      method: string;
      providerData?: any;
    },
  ) {
    return this.svc.record(
      body.appointmentId,
      body.amount,
      body.method,
      body.providerData,
    );
  }
}
