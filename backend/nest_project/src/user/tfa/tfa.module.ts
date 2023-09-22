import { Module } from '@nestjs/common';
import { TfaController } from './tfa.controller';
import { TfaService } from './tfa.service';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/jwt.strategy';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TfaController],
  providers: [TfaService, ConfigService, JwtStrategy]
})
export class TfaModule {}
