import { Module } from '@nestjs/common';
import { TfaController } from './tfa.controller';
import { TfaService } from '../tfa/tfa.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [TfaController],
  providers: [TfaService, ConfigService]
})
export class TfaModule {}
