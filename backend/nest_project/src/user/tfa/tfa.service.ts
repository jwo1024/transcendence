import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import emailConfig from './email.config';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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
 
    async generateSecret(): Promise<string> {
        const len = this.configService.get('TFA_TOKEN_SIZE') | 32;
        try {
            const ret = await crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
            return ret;
        } catch (err) {
            console.log('Error Occured in generateSecret[2FA] : ', err);
            return null; 
        }
    }
    
    register2FA(id: number, email: string, token: string, issuedAt: Date) {
        const tfaData: TfaData = {
            email : email,
            token : token,
            issuedAt: issuedAt,
            verified: false
        }
        this.tfaData.set(id, tfaData);
    }
    
    async sendVerificationEmail(id: number, email: string, otp: string){
    
        const mailOptions = {
            from: 'INFtransendenceTP',
            to: email,
            subject : '2FA Verification',
            text : `otp: ${otp}`
        }
        try { await this.transporter.sendMail(mailOptions);
            return new Date();
        }
        catch (err) {
            console.log('Error Occured in sendVerificationEmail[2FA] : ', err); 
            return null;
        }                
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