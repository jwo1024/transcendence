import { Controller, Post } from '@nestjs/common';
import { TfaService } from './tfa.service';

@Controller('tfa')
export class TfaController {
    constructor(
        private tfaService: TfaService
    ) {}
}