import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tfa')
@UseGuards(AuthGuard())
export class TfaController {
    constructor(
        private tfaService: TfaService
    ) {}

    

    @Post('send')
    async send(@Req() req, @Res() res, @Body() body) {
        //  else if (this.tfaService.is2FAConfirmed(req.user.userId))
        //    return res.status(409).send('already verified');
        let issuedAt: Date = null;
        try { 
            issuedAt = await this.tfaService.generate2FA(req.user.userId, body.email); }
        catch (err) {
            if (err instanceof HttpException) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('failed to send email');
            else if (err instanceof Error) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('failed to generate token')
        }
        // try { await this.tfaService.sendVerificationEmail(req.user.userId); }
        // catch (err) {
        //     console.log('Error Occured in make2FA[2FA] : ', err);
        //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('failed to send email');
        // }
        return res.status(HttpStatus.OK).json({ issuedAt: '2fa-make success' });
    }

    @Post('verify')
    verify(@Req() req, @Res() res, @Body() body) {
        try {
            this.tfaService.check2FAValidity(req.user.userId, body.code);
            return res.status(HttpStatus.OK).json({ message: '2fa-verify success' });
        } catch (err) {
            console.log('Error Occured in verify[2FA] : ', err);            
            return res.status(HttpStatus.UNAUTHORIZED).send('2fa-verify failed');
        }
    }

    ///////////////////////////////////////////////////
    // 로그오프 시 2FA 데이터 반드시 삭제해야함.////////////////
    // PageValidation에서 unchecked 2FA 반드시 추방해야함////
    ///////////////////////////////////////////////////
}