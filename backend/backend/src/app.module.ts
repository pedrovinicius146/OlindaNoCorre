import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CurriculoModule } from './curriculo/curriculo.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [AuthModule, UsersModule, JobsModule, CurriculoModule, MatchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
