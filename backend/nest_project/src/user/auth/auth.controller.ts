import { Controller, Get, Post, Query, Req, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ProfileService } from '../profile/profile.service';
import { User42Dto } from './dto/user42.dto';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

class Image42 {
  url: string;
  token: string;
}

@Controller('auth')
export class AuthController { 
  image42: Map<number, Image42> = new Map<number, Image42>(); // 이 컨트롤러 내부에서만 사용될 자료구조
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  @Get('getUrl')
  getURL(): string {
    return this.authService.getRedirectUrlTo42Auth();
  }

  @Get('redirect')
  async redirectFrom42Auth(@Req() req: Request, @Res() res: Response, @Query() query: any) {
    const accessTokenOf42User = await this.authService.getAccessTokenOf42User(query.code);
    const userDataFrom42: User42Dto = await this.authService.getUserDataFrom42(accessTokenOf42User);

    const imageData : Image42 = new Image42();
    imageData.url = userDataFrom42.image_url;
    imageData.token, accessTokenOf42User;
    this.image42.set(userDataFrom42.id, imageData);

    const token = await this.authService.jwtCreation(userDataFrom42.id);
    res.cookie('accessToken', token.accessToken, { httpOnly: false });
    const userProfile = await this.profileService.getUserProfileById( userDataFrom42.id );
    if (!userProfile)
      res.cookie('user42Dto', JSON.stringify(userDataFrom42), { httpOnly: false });
    res.redirect('http://localhost:3001/signup');
  }

  @Get('defaultAvatar')
  @UseGuards(AuthGuard())
  async getDefaultAvatar(@Req() req, @Res() res) {
    try {
      const id = req.user.userId;
      const data = this.image42.get(id);
      const imageStream = await this.authService.downloadDefaultAvatar(data.url, id, data.token);
      res.set('Content-Type', 'image/jpeg');
      imageStream.pipe(res); 
      delete this.image42[id];
    }
    catch (error) {
      console.log('Error Occured in DefaultAvatar Router');
      throw new Error('Error Occured in DefaultAvatar Router');
    }
  }

  @Get('validity') // 로그인 이후 (/와 /signup을 제외한)_app.tsx의 모든 페이지에 대해서 시작 부분에 놓는다
  @UseGuards(AuthGuard())
  async session(@Req() req) {
    const accessToken = req.headers.authorization?.split('Bearer ')[1];
    const userId = req.user.userId;
    if (!AuthService.isTokenValid(userId, accessToken)) {
        console.log(`[session request for invalid or outdated token] - (user : ${userId})`);
        console.log(`value : {${accessToken}}`);
        throw new UnauthorizedException('session request for invalid or outdated token');
    }
  }
    
  @Post('logon') // signup을 나가면서 logon 요청
  @UseGuards(AuthGuard())  // logon은 AuthGuard 거치지만, logout은 거치지 않는다. 왜냐하면 창 닫힐 때는 처리 속도가 빨라야해서 fetch가 아닌 sendBeacon으로 처리하기 때문이다. sendbeacon은 header를 못넣는다. 그래서 AuthGuard를 거치지 않는다.
  async logOn(@Req() req) {
    const userId = req.user.userId;
    const user = await this.profileService.getUserProfileById(userId);
    if (!user)
      throw new Error('user not found');
    else { 
      await this.profileService.logOn(userId);
      const { id, nickname, status, ladder, wins, loses } = user; // 브라우저의 localStorage에 저장될 정보라고 함
      return { id, nickname, status, ladder, wins, loses };
    } 
  }

  @Post('logoff')
  async logOff(@Req() req) {
    console.log(`logoff request`);
    const accessToken = req.headers.cookie.split('=')[1];
    const userId = await jwt.decode(accessToken)['userId'];
    if (AuthService.isTokenValid(userId, accessToken)) {
      console.log('token is valid');
      AuthService.endSession(userId);
      await this.profileService.logOff(userId);
    }
    else {
      console.log(`[logoff request for invalid or outdated token] - (user : ${userId})`);
      console.log(`value : {${accessToken}}`);
    }
    console.log(`logoff done`);
  }
  
}