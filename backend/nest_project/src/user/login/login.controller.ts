import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginService } from './login.service';
import { ProfileService } from '../profile/profile.service';
import { User42Dto } from './dto/user42.dto';

@Controller('login')
export class LoginController {
    constructor(
        private loginService : LoginService,
        private profileService : ProfileService,
        ) {}
    
        @Get('/first') // mock_front_page
        getLoginPage() : string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Example</title>
        </head>
        <body>
          <h1>Login with Resource Server</h1>
          <button id="loginButton">Login with Resource Server</button>
          
          <script>
            // 클릭 이벤트 리스너를 등록합니다.
            const loginButton = document.getElementById('loginButton');
            loginButton.addEventListener('click', () => {
              // 클릭 시 특정 사이트로 리다이렉트됩니다.
              window.location.href = '${this.loginService.getRedirectUrlTo42Auth()}';
            });
          </script>
        </body>
        </html>
        `;
    }

    @Get('redirect')
    async redirectFrom42Auth(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        const accessTokenOf42User = await this.loginService.getAccessTokenOf42User(query.code);
        if (accessTokenOf42User === null) {
            return 'error in redirectFrom42Auth(getAccessTokenOf42User)' // TODO: error page
        }
        const userDataFrom42: User42Dto = await this.loginService.getUserDataFrom42(accessTokenOf42User);
        if (userDataFrom42 === null) {
            return 'error in redirectFrom42Auth(getUserDataFrom42)' // TODO: error page
        }
         
        const userProfile = await this.profileService.getUserProfileById(userDataFrom42.id);
        console.log('userProfile: ', userProfile);
        if (userProfile) {
            console.log('여기');
            res.redirect('/login/main');
        }
        else {
            res.send("[FrontEnd.signupForm] userDataFrom42 : " + JSON.stringify(userDataFrom42));
        }
        // 자 여기서! 이제 userDataFrom42를 가지고, DB에 저장된 유저인지 확인하고, 없으면 DB에 저장하고, 있으면 그냥 로그인 시키면 됨.
    }

    @Get('getUrl')
    getURL() :string {
        return this.loginService.getRedirectUrlTo42Auth()
    }


    @Get('main')
    getMainPage() : string {
        return 'this is main_page';
    }
}