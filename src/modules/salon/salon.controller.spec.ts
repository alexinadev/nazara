import { Test, TestingModule } from '@nestjs/testing';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';

describe('SalonController', () => {
  let controller: SalonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalonController],
      providers: [SalonService],
    }).compile();

    controller = module.get<SalonController>(SalonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
