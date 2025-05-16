import { Test, TestingModule } from '@nestjs/testing';
import { CurriculoController } from './curriculo.controller';

describe('CurriculoController', () => {
  let controller: CurriculoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurriculoController],
    }).compile();

    controller = module.get<CurriculoController>(CurriculoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
