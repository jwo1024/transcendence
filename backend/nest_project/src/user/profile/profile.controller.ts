import { Body, Controller, Get, Param, Post, Req, UseGuards, Res, ConflictException, UseInterceptors, UploadedFile, BadRequestException, NotImplementedException, HttpStatus } from '@nestjs/common';
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
import { isEmail } from 'class-validator';
import { sign } from 'crypto';

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
    
    @Post('/rename')
    async renameUserProfile(@Req() req, @Res() res, @Body() body) {
        const rename = body.rename;
        if (!rename || rename === undefined) return res.status(400).send('invalid nickname');
        const renamed = await this.profileService.getUserProfileByNickname(rename);
        if (renamed != null) return res.status(409).send('nickname already exists');
        const user = await this.profileService.getUserProfileById(req.user.userId);
        user.nickname = rename;
        await this.profileService.updateUserProfileById(req.user.userId, user);
        return res.status(200).send('nickname changed');
    }

    @Post('/update/id/:id') // 이 라우터로는 요청 안올거다.
    updateUserProfileById(@Param('id') id : number, @Body() updateDto: any) {
        return this.profileService.updateUserProfileById(id, updateDto);
    }
    
    @Post('/update/nickname/:nickname') // 이 라우터로는 요청 안올거다.
    updateUserProfileByNickname(@Param('nickname') nickname : string, @Body() updateDto: any) {
        return this.profileService.updateUserProfileByNickname(nickname, updateDto);
    }
        

    @Get('image')
    async getImage(@Req() req, @Res() res) {
        console.log('myImageData requested, req.user : ' , req.user);

        const user = await this.profileService.getUserProfileById(req.user.userId);
        if (!user)
            throw new BadRequestException('user not found');
        const imageBase64 = user.avatar.toString('base64');
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        res.set('Content-Type', 'image/jpeg');
        return res.send(imageBuffer);
    } 

    @Get('image/:id')
    async getMyImage(@Req() req, @Res() res, @Param('id') id : number) {
        console.log('id : ', id);
        const user = await this.profileService.getUserProfileById(id);
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
   async signUp(@Req() req, @Res() res, @Body() signUpDto: SignupDto) { 
    const requserId = req.user.userId;
    if (requserId != signUpDto.id)
        throw new Error('invalid user id');
    const result = await this.profileService.getUserProfileById(requserId);
    if (result) { // 진짜 이상한, 발생하면 안되는 상황
        console.log('[409 Exception]user(', requserId, ') already exists');
        res.status(409).send('user already exists');
        throw new ConflictException('user already exists');
    }
    if (signUpDto.enable2FA && isEmail(signUpDto.data2FA) == false)
        return res.status(HttpStatus.BAD_REQUEST).send('invalid email');
    const duplicated = await this.profileService.getUserProfileByNickname(signUpDto.nickname);
    if (duplicated)
        return res.status(HttpStatus.CONFLICT).send('duplicated nickname');
    this.profileService.signUp(signUpDto);
    return res.status(201).send('user creation success');
   }
}