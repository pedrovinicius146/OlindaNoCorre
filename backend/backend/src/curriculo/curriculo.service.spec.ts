import { Test, TestingModule } from '@nestjs/testing';
import { CurriculoService } from './curriculo.service';

describe('CurriculoService', () => {
  let service: CurriculoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurriculoService],
    }).compile();

    service = module.get<CurriculoService>(CurriculoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
