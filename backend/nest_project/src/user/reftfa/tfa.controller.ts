import { BadRequestException, Body, ConflictException, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TfaService } from '../tfa/tfa.service';

@Controller('tfa')
@UseGuards(AuthGuard())
export class TfaController {
    constructor(
        private tfaService: TfaService
    ) {}

    @Post('make2FA')
    make2FA(@Req() req, @Res() Res, @Body() body) {
        if (!this.tfaService.validateEmail(body.email))
            throw new BadRequestException('invalid email');
        else if (this.tfaService.is2FARegistered(req.user.userId))
            throw new ConflictException('already registered');
        else {
            const token = this.tfaService.generateRandomString(32);
            if (token === undefined)
                throw new HttpException('failed to generate token', HttpStatus.INTERNAL_SERVER_ERROR);
            this.tfaService.register2FA(req.user.userId, body.email, token);
            this.tfaService.sendVerificationEmail(req.user.userId);
        }
    }
    
    @Post('verify')
    verify(@Req() req, @Res() res, @Body() body) {
        try {
            this.tfaService.check2FAValidity(req.user.userId, body.token);
            // this.tfaService.remove2FAData(req.user.userId);
            return res.status(HttpStatus.OK).json({ message: '2fa-verify success' });
        } catch (error) {
            console.log('Error Occured in verify[2FA] : ', error);            
            throw new UnauthorizedException('2fa-verify failed');
        }
    }

}
