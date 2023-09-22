import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tfa')
@UseGuards(AuthGuard())
export class TfaController {
    constructor(
        private tfaService: TfaService
    ) {}

    @Post('make2FA')
    make2FA(@Req() req, @Res() res, @Body() body) {
        //  else if (this.tfaService.is2FAConfirmed(req.user.userId))
        //    return res.status(409).send('already verified');
        if (!this.tfaService.validateEmail(body.email))
            return res.status(HttpStatus.BAD_REQUEST).send('invalid email');
        else {
            const token = this.tfaService.generateRandomString(32);
            if (token === undefined)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('failed to generate token')
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
        } catch (err) {
            console.log('Error Occured in verify[2FA] : ', err);            
            return res.status(HttpStatus.UNAUTHORIZED).send('2fa-verify failed');
        }
    }
}