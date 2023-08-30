import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserProfile } from './user-profile.entity';
import { SignupDto } from './dto/signup.dto';

@Controller('profile')
export class ProfileController {
    // 이것은 백엔드 로직이므로, Get 요청에 대해 직접 값을 리턴하면 안된다.
    constructor(private profileService: ProfileService) {}
    @Get()
    getStringForTest(): string {
        const str = 'Hello jchoi!'
        return str;
    }
    
    @Post('/signup')
    signUp(@Body() signUpDto: SignupDto): Promise<UserProfile> {
        return this.profileService.signUp(signUpDto);
    }

    @Get('/all')
    getAllUserProfiles(): Promise<UserProfile[]> {
        return this.profileService.getAllUserProfiles();
    }

    @Get('/id/:id')
    getUserProfileById(@Param('id') id : number): Promise<UserProfile> {
        return this.profileService.getUserProfileById(id);
    }

    @Get('/nickname/:nickname')
    getUserProfileByNickname(@Param('nickname') nickname : string): Promise<UserProfile> {
        return this.profileService.getUserProfileByNickname(nickname);
    }

    @Post('/delete/:id')
    deleteUserProfileById(@Param('id') id : number): Promise<void> {
        return this.profileService.deleteUserProfileById(id);
    }

    @Post('/delete/nickname/:nickname')
    deleteUserProfileByNickname(@Param('nickname') nickname : string): Promise<void> {
        return this.profileService.deleteUserProfileByNickname(nickname);
    }

    @Post('/update/id/:id')
    updateUserProfileById(@Param('id') id : number, @Body() updateDto: SignupDto): Promise<UserProfile> {
        return this.profileService.updateUserProfileById(id, updateDto);
    }

    @Post('/update/nickname/:nickname')
    updateUserProfileByNickname(@Param('nickname') nickname : string, @Body() updateDto: SignupDto): Promise<UserProfile> {
        return this.profileService.updateUserProfileByNickname(nickname, updateDto);
    }
}
