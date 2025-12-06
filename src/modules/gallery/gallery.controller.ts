import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private svc: GalleryService) {}

  @Post()
  add(@Body() body: any) {
    return this.svc.add(body);
  }

  @Get()
  list(@Query('salonId') salonId: string) {
    return this.svc.listBySalon(salonId);
  }
}
