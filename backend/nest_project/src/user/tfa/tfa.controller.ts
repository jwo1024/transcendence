import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TfaData, TfaService } from './tfa.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tfa')
@UseGuards(AuthGuard())
export class TfaController {
    constructor( private tfaService: TfaService ) {}

    @Post('send')
    async send(@Req() req, @Res() res, @Body() body) {
        if (!body || !body.email)
            return res.status(HttpStatus.CONFLICT).send('invalid request');
        const id = req.user.userId;
        const otp = await this.tfaService.generateSecret();
        if (!otp) return res.status(HttpStatus.CONFLICT).send('failed to generate token');
        const issuedAt = await this.tfaService.sendVerificationEmail(id, body.email, otp);
        if (!issuedAt)
            return res.status(HttpStatus.CONFLICT).send('failed to send email');
        else {
            this.tfaService.register2FA(id, body.email, otp, issuedAt);
            return res.status(HttpStatus.OK).json({ issuedAt: issuedAt });
        }
    }

    @Post('verify')
    verify(@Req() req, @Res() res, @Body() body) {
        if (!body || !body.code)
            return res.status(HttpStatus.UNAUTHORIZED).send('invalid request');
        try {
            this.tfaService.check2FAValidity(req.user.userId, body.code);
            return res.status(HttpStatus.OK).json({ message: '2fa-verify success' });
        } catch (err) {
            console.log('Error Occured in verify[2FA] : ', err);            
            return res.status(HttpStatus.UNAUTHORIZED).send('2fa-verify failed');
        }
    }
}