import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';

@Controller('discounts')
export class DiscountController {
  constructor(private svc: DiscountService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get()
  list() {
    return this.svc.list();
  }

  @Get('code')
  byCode(@Query('code') code: string) {
    return this.svc.findByCode(code);
  }
}
