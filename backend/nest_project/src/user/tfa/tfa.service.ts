import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import emailConfig from './email.config';
import { isEmail } from 'class-validator';
import { pseudoRandomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';


////////////////////////////////////////////////
///[ 1. config에, Tfa expire time을 넣어야한다. ]///
///[ 2. /auth/validate에, undone 2FA인 id를 폐기하는 처리를 해야한다.]///
////////////////////////////////////////////////

export interface TfaData {
    email: string;
    token: string;
    issuedAt: Date; 
    verified: boolean;
}


@Injectable()
export class TfaService {
    private readonly transporter;
    private readonly tfaData: Map<number, TfaData> = new Map();
    constructor(
        private configService: ConfigService  
    ) { this.transporter = nodemailer.createTransport(emailConfig.transport); }

    is2FARegistered(id: number) : Boolean {
        return (this.tfaData.has(id));
    }

    is2FAConfirmed(id: number) : Boolean {
        return (this.tfaData.has(id) && this.tfaData.get(id).verified === true);
    }

    remove2FAData(id: number) {
        this.tfaData.delete(id);
    }

    async validateEmail(email: string): Promise<boolean> {
        return isEmail(email);
    }
    
    async generate2FA(id: number, email:string) : Promise<any> {
        const size = Number(this.configService.get('TFA_TOKEN_SIZE')) | 32;
        await pseudoRandomBytes(size, (err, buffer) => {
            if (err) {
                console.log('Error Occured in generateRandomString(psuedoRandomBytes)');
                throw err;
            } 
            const randomData = buffer.toString('hex'); // 난수를 16진수 문자열로 변환            
            console.log('[g2FA]id : ', id);
            console.log('[g2FA]email : ', email)
            console.log('[g2FA]randomData : ', randomData);
            this.register2FA(id, email, randomData);
            try { return this.sendVerificationEmail(id); }
            catch (err) {
                console.log('Error Occured in generate2FA[2FA] : ', err);
                throw new HttpException('failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
     }
    
    register2FA(id: number, email: string, token: string) {
        const tfaData: TfaData = {
            email : email,
            token : token,
            issuedAt: new Date(),
            verified: false
        }
        this.tfaData.set(id, tfaData);
    }
    
    async sendVerificationEmail(id: number) : Promise <Date> {
        console.log('[sVE]id : ', id);
        
        const tFA: TfaData = this.tfaData.get(id);
        console.log('[sVE]tfaData : ', tFA);

        if (tFA === undefined)
            throw new HttpException('invalid id', HttpStatus.BAD_REQUEST);
        else {
            const mailOptions = {
                from: 'your_email@example.com', // 바꿔야함 INFtransendenceTP 였던가.
                to: tFA.email,
                subject : '2FA Verification',
                text : `token: ${tFA.token}`
                 // 이것도 바꿔야함 프론트엔드에 대한 요청 링크로
            }  
            try { await this.transporter.sendMail(mailOptions); }
            catch (err) {
                console.log('Error Occured in sendVerificationEmail[2FA] : ', err); 
                throw new HttpException('failed to send email', HttpStatus.INTERNAL_SERVER_ERROR); }
        }
        return tFA.issuedAt;
    }
    
    check2FAValidity(id: number, token: string){
        const tfaData = this.tfaData.get(id);
        if (tfaData === undefined)
            throw new HttpException('invalid id', HttpStatus.BAD_REQUEST);
        else if (tfaData.token !== token)
            throw new HttpException('invalid token', HttpStatus.BAD_REQUEST);
        else if (tfaData.issuedAt.getTime() + this.configService.get('TFA_EXPIRES_IN') < new Date().getTime())
            throw new HttpException('token expired', HttpStatus.BAD_REQUEST);
        tfaData.verified = true;
    }


}