import { Module } from '@nestjs/common';
import { CurriculoController } from './curriculo.controller';
import { CurriculoService } from './curriculo.service';

@Module({
  controllers: [CurriculoController],
  providers: [CurriculoService]
})
export class CurriculoModule {}
