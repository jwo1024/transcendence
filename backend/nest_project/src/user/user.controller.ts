import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { ProfileService } from './profile/profile.service';

@Controller('user')
export class UserController {
    constructor(private loginService : LoginService,
        private profileService : ProfileService){}
    @Post('signup')
    postSignup(@Body() body: any) {
        try {
            // TODO: check if user nickname
            const user = this.profileService.getUserProfileByNickname(body.nickname);
            if (user) {
                return 'duplicated nickname'; // HTTP status code with 409 Conflict.
            }
            this.profileService.signUp(body);
            return 'signup success'; // HTTP status 200? < 201?
        }
        catch (error) {
            console.log('error in postSignup: ', error);
        }
    }
}
