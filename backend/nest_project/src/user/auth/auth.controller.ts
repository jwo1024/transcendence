import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ProfileService } from '../profile/profile.service';
import { User42Dto } from './dto/user42.dto';
import { AuthGuard } from '@nestjs/passport';
import { userStatus } from '../profile/user-profile.entity';
import { TfaService } from '../tfa/tfa.service';

class Image42 {
  url: string;
  token: string;
}

@Controller('auth')
export class AuthController {
  image42: Map<number, Image42> = new Map<number, Image42>();
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private tfaService: TfaService,
  ) {}

  @Get('getUrl')
  getURL(): string {
    return this.authService.getRedirectUrlTo42Auth();
  }

  @Get('redirect')
  async redirectFrom42Auth(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const accessTokenOf42User = await this.authService.getAccessTokenOf42User(
      query.code,
    );
    const userDataFrom42: User42Dto =
      await this.authService.getUserDataFrom42(accessTokenOf42User);

    const token = await this.authService.jwtCreation(userDataFrom42.id);
    res.cookie('accessToken', token.accessToken, { httpOnly: false });
    const userProfile = await this.profileService.getUserProfileById(
      userDataFrom42.id,
    );
    if (!userProfile) {
      const imageData: Image42 = new Image42();
      imageData.url = userDataFrom42.image_url;
      imageData.token = accessTokenOf42User;
      this.image42.set(userDataFrom42.id, imageData);
      res.cookie('user42Dto', JSON.stringify(userDataFrom42), {
        httpOnly: false,
      });
    } else if (userProfile.enable2FA)
      res.cookie('twoFA', userProfile.data2FA, { httpOnly: false });
    res.redirect(`${process.env.FRONTEND_URL}/signup`);
  }

  @Get('defaultAvatar')
  @UseGuards(AuthGuard())
  async getDefaultAvatar(@Req() req, @Res() res) {
    try {
      const id = req.user.userId;
      const data = this.image42.get(id);
      const imageStream = await this.authService.downloadDefaultAvatar(
        data.url,
        id,
        data.token,
      );
      res.set('Content-Type', 'image/jpeg');
      imageStream.pipe(res);
      delete this.image42[id];
    } catch (error) {
      console.log('Error Occured in DefaultAvatar Router');
      throw new Error('Error Occured in DefaultAvatar Router');
    }
  }

  @Get('validity')
  @UseGuards(AuthGuard())
  async session(@Req() req, @Res() res) {
    const accessToken = req.headers.authorization?.split('Bearer ')[1];
    const userId = req.user.userId;
    if (!AuthService.isTokenValid(userId, accessToken)) {
      console.log(
        `[session request for invalid or outdated token] - (user : ${userId})`,
      );
      console.log(`value : {${accessToken}}`);
      console.log(`valid token : ${AuthService.getSession(userId)}`);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send({ message: '[validity fail] : invalid token' });
    }
    if (
      this.tfaService.is2FARegistered(userId) &&
      !this.tfaService.is2FAConfirmed(userId)
    ) {
      console.log('2fa is not confirmed');
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send({ message: '[validity fail] : 2fa is not confirmed' });
    }
    return res
      .status(HttpStatus.OK)
      .send({ message: '[validity success] : valid session' });
  }

  @Post('logon')
  @UseGuards(AuthGuard())
  async logOn(@Req() req, @Res() res) {
    const userId = req.user.userId;
    const accessToken = req.headers.authorization?.split('Bearer ')[1];
    const user = await this.profileService.getUserProfileById(userId);
    if (!user)
      throw new Error('user not found');
    else { 
      if (user.status !== userStatus.inGame) {
        AuthService.setSession(userId, accessToken);
        await this.profileService.logOn(userId);
        const { id, nickname, status, ladder, wins, loses } = user;
        return res.send({ id, nickname, status, ladder, wins, loses });
      }
      else {
        console.log('user is already in game');
        res.redirect(`${process.env.FRONTEND_URL}`);
      }
    }
  }

  @Post('logoff')
  @UseGuards(AuthGuard())
  async logOff(@Req() req) {
    const userId = req.user.userId;
    const accessToken = req.headers.authorization?.split('Bearer ')[1];
    console.log(`parsed token[${userId}] : ${accessToken}`);
    if (AuthService.isTokenValid(userId, accessToken)) {
      console.log('token is valid');
      this.tfaService.remove2FAData(userId);
      AuthService.endSession(userId);
      await this.profileService.logOff(userId);
    } else {
      console.log(
        `[logoff request for invalid or outdated token] - (user : ${userId})`,
      );
      console.log(`value : {${accessToken}}`);
    }
    console.log(`logoff done`);
  }
}
