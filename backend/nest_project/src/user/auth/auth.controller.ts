import { Controller, Get, Query, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ProfileService } from '../profile/profile.service';
import { User42Dto } from './dto/user42.dto';

@Controller('auth')
export class AuthController {
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
    const accessTokenOf42User = await this.authService.getAccessTokenOf42User(
      query.code,
    );
    const userDataFrom42: User42Dto =
      await this.authService.getUserDataFrom42(accessTokenOf42User);
    const token = await this.authService.jwtCreation(userDataFrom42.id);
    res.cookie('accessToken', JSON.stringify(token.accessToken), {
      httpOnly: false,
    });
    const userProfile = await this.profileService.getUserProfileById(
      userDataFrom42.id,
    );
    if (userProfile) {
      res.redirect('http://localhost:3001/menu');
    } else {
      res.cookie('user42Dto', JSON.stringify(userDataFrom42), {
        httpOnly: false,
      });
      await this.authService.downloadDefaultAvatar(userDataFrom42.image_url, userDataFrom42.id, accessTokenOf42User); 
      res.redirect('http://localhost:3001/signup');
    }
  }

}
// 그다음 찾아서, 프론트에 리다이렉트를 해주면 되는것 같다.

// 이것도 이것대로 공부를 좀 해둬야하겠다.

// 여기서부터 jwt 토큰을 발급할거야.
// jwt 토큰을 발급하고 나서, 프론트로 jwt 토큰을 보내줘야해.
// 프론트에서는 jwt 토큰을 받아서, 로컬 스토리지에 저장해두고,
// 로컬 스토리지에 저장된 jwt 토큰을 통해서, 로그인 여부를 판단할거야.
// 로그인 여부를 판단하는 방식은, 로컬 스토리지에 저장된 jwt 토큰을 서버에 보내서,
// 서버에서 jwt 토큰을 검증하는 방식으로 할거야.
// jwt 토큰 검증이 성공하면, 로그인이 되어있는거고,
// jwt 토큰 검증이 실패하면, 로그인이 안되어있는거야.
// 로그인이 안되어있으면, 로그인 페이지로 리다이렉트 시킬거야.
// 로그인이 되어있으면, 메뉴 페이지로 리다이렉트 시킬거야.
// 이렇게 하면, 로그인 여부를 판단할 수 있어.
// 그리고, 로그인이 되어있는 상태에서, 메뉴 페이지에서 로그아웃을 누르면,
// 로컬 스토리지에 저장된 jwt 토큰을 삭제하고, 로그인 페이지로 리다이렉트 시킬거야.
// 이렇게 하면, 로그아웃이 되어있는 상태가 되는거야.
// 로그아웃이 되어있는 상태에서, 메뉴 페이지로 접근하면,
// 로컬 스토리지에 저장된 jwt 토큰이 없기 때문에,
// 로그인 페이지로 리다이렉트 시킬거야.
// 이렇게 하면, 로그인 여부를 판단할 수 있어.
