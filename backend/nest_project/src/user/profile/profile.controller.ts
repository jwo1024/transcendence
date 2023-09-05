import { Body, Controller, Get, Param, Post, Req, UseGuards, Res, ConflictException, UseInterceptors, UploadedFile, BadRequestException, NotImplementedException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserProfile } from './user-profile.entity';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import  { Response } from 'express';
import { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as fsp from 'fs/promises';

@Controller('profile')
@UseGuards(AuthGuard())
export class ProfileController {
    // 이것은 백엔드 로직이므로, Get 요청에 대해 직접 값을 리턴하면 안된다.
    constructor(private profileService: ProfileService) {}
    
    @Get('/all') // 실제 서비스에서는 사용하지 않을 것이다.
    getAllUserProfiles(@Req() req): Promise<UserProfile[]> {
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
    
    @Post('/delete/id/:id')
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
        
    @Get('images/:id')
    async getImage(@Param('id') id: number, @Res() res : Response) {
        try {
            const imagePath = join(__dirname, 'images', `${id}` )
            const user = await this.profileService.getUserProfileById(id)
            if (user) {
                await fsp.writeFile(imagePath, user.avatar);
            }
            res.set('Content-Type', 'image/jpeg');
            return res.sendFile(imagePath);
        } catch (err) {
            throw new Error( `[${id}] : `+ 'Image not found');
        }
    }
    
    @Post('images/:id')
    @UseInterceptors(FileInterceptor('image')) // 'image'는 파일 필드의 이름입니다.
    async uploadImage(@Param('id') id: string, @UploadedFile() image: Express.Multer.File, @Body() body) {
        // 파일 제한을 걸자. 이후에 Pipe를 사용하면 좋을 것 같다. ext는 검사할때만 사용하고, 실제 저장할때는 사용하지 않는다.
        // @CustomValidationPipe(body.ext) 라든지 이런식으로 사용하면 좋을 것 같다.
        const filePath = join(__dirname, 'images', `${id}` ); 
  
        // 이미지 파일을 지정된 경로로 이동 또는 복사
        await fs.rename(image.path, filePath, err => {
            if (err) {
                console.log('fs.rename error in uploadImage');
                throw new NotImplementedException('이미지 업로드 실패');
            }
        });
    }
    
   @Post('/signup')
   async signUp(@Req() req, @Body() signUpDto: SignupDto) {
       if (req.user != signUpDto.id)
           throw new Error('invalid user id');
       const result = await this.profileService.getUserProfileById(req.user);
       if (result) {
           console.log('[409 Exception]user(', req.user, ') already exists');
           throw new ConflictException('user already exists');
       }
       this.profileService.signUp(signUpDto, join(__dirname, 'images', `${signUpDto.id}`));
       return {statusCode: 201, message: 'user creation success'};
   }

}
