import { Test, TestingModule } from '@nestjs/testing';
import { AppointementController } from './appointement.controller';
import { AppointementService } from './appointement.service';

describe('AppointementController', () => {
  let controller: AppointementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointementController],
      providers: [AppointementService],
    }).compile();

    controller = module.get<AppointementController>(AppointementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
