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
import { memoryStorage } from 'multer';

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
        

    @Get('image') //!!!!!!!!!!!!!!!!!!!!!!!!!!! 아무래도 param으로 바꿔야할듯 싶다. 친구 profile도 띄워야하니까
    async getImage(@Req() req, @Res() res : Response) {
        const user = await this.profileService.getUserProfileById(req.user.userId);
        if (!user)
            throw new BadRequestException('user not found');
        const imageBase64 = user.avatar.toString('base64');
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        res.set('Content-Type', 'image/jpeg');
        return res.send(imageBuffer);
    } 
    
    @Post('image')
    @UseInterceptors(FileInterceptor('image', {storage: memoryStorage()})) // 이미지를 메모리에 저장합니다.
    async uploadImage(@Req() req, @UploadedFile() image: Express.Multer.File) {
        try {
            if (!image) {
            console.log('no image uploaded');// 이미지가 업로드되지 않았을 경우 에러 처리
            throw new Error('No image uploaded');
            }
            console.log('Image uploaded successfully');
            return await this.profileService.updateAvatar(req.user.userId, image.buffer);            // avatar.buffer에 이미지 데이터가 Buffer 형태로 저장됩니다.
             } catch (error) {
        console.log('error in uploadImage : ', error);
          throw new Error(error.message);
        }
    }
    
   @Post('/signup')
   async signUp(@Req() req, @Body() signUpDto: SignupDto) { 
    const requserId = req.user.userId;   
    if (requserId != signUpDto.id)
           throw new Error('invalid user id');
       const result = await this.profileService.getUserProfileById(requserId);
       if (result) {
           console.log('[409 Exception]user(', requserId, ') already exists');
           throw new ConflictException('user already exists');
       }
       // 이미지를 잘 받아와야합니다.
       this.profileService.signUp(signUpDto); //, join(__dirname, 'images', `${signUpDto.id}`));
       return {statusCode: 201, message: 'user creation success'};
   }
}
