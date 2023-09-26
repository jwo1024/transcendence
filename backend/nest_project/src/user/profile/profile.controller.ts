import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Res,
  ConflictException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotImplementedException,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserProfile } from './user-profile.entity';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
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
  constructor(private profileService: ProfileService) {
    this.profileService.initUsers();
  }

  @Get('/all')
  getAllUserProfiles(@Req() req): Promise<UserProfile[]> {
    return this.profileService.getAllUserProfiles();
  }

  @Get('/id/:id')
  getUserProfileById(@Param('id') id: number): Promise<UserProfile> {
    if (id == null || id === undefined)
      throw new BadRequestException('invalid id');
    return this.profileService.getUserProfileById(id);
  }

  @Get('/nickname/:nickname')
  getUserProfileByNickname(
    @Param('nickname') nickname: string,
  ): Promise<UserProfile> {
    if (nickname == null || nickname === undefined)
      throw new BadRequestException('invalid id');
    return this.profileService.getUserProfileByNickname(nickname);
  }

  @Post('/rename')
  async renameUserProfile(@Req() req, @Res() res, @Body() body) {
    if (!body || !body.rename) return res.status(400).send('invalid nickname');
    const rename = body.rename;
    const renamed = await this.profileService.getUserProfileByNickname(rename);
    if (renamed != null) return res.status(409).send('nickname already exists');
    const user = await this.profileService.getUserProfileById(req.user.userId);
    user.nickname = rename;
    await this.profileService.updateUserProfileById(req.user.userId, user);
    return res.status(200).send('nickname changed');
  }

  @Post('/update/id/:id')
  updateUserProfileById(@Param('id') id: number, @Body() updateDto: any) {
    if (!id || !updateDto) throw new BadRequestException('BadReqeustException');
    return this.profileService.updateUserProfileById(id, updateDto);
  }

  @Post('/update/nickname/:nickname')
  updateUserProfileByNickname(
    @Param('nickname') nickname: string,
    @Body() updateDto: any,
  ) {
    if (!nickname || !updateDto)
      throw new BadRequestException('BadReqeustException');
    return this.profileService.updateUserProfileByNickname(nickname, updateDto);
  }

  @Get('image')
  async getImage(@Req() req, @Res() res) {
    console.log('myImageData requested, req.user : ', req.user);

    const user = await this.profileService.getUserProfileById(req.user.userId);
    if (!user) throw new BadRequestException('user not found');
    if (user.avatar === null)
      return res.status(HttpStatus.NOT_FOUND).send('image not found');
    const imageBase64 = user.avatar.toString('base64');
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    res.set('Content-Type', 'image/jpeg');
    return res.send(imageBuffer);
  }

  @Get('image/:id')
  async getMyImage(@Req() req, @Res() res, @Param('id') id: number) {
    if (!id) throw new BadRequestException('invalid id');
    console.log('id : ', id);
    const user = await this.profileService.getUserProfileById(id);
    if (!user) throw new BadRequestException('user not found');
    const imageBase64 = user.avatar.toString('base64');
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    res.set('Content-Type', 'image/jpeg');
    return res.send(imageBuffer);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(@Req() req, @UploadedFile() image: Express.Multer.File) {
    try {
      if (!image) {
        console.log('no image uploaded');
        throw new Error('No image uploaded');
      }
      console.log('Image uploaded successfully');
      return await this.profileService.updateAvatar(
        req.user.userId,
        image.buffer,
      );
    } catch (error) {
      console.log('error in uploadImage : ', error);
      throw new Error(error.message);
    }
  }

  @Post('/signup')
  async signUp(@Req() req, @Res() res, @Body() signUpDto: SignupDto) {
    const requserId = req.user.userId;
    if (!signUpDto || requserId != signUpDto.id)
      throw new Error('invalid input');
    const result = await this.profileService.getUserProfileById(requserId);
    if (result) {
      console.log('[409 Exception]user(', requserId, ') already exists');
      res.status(409).send('user already exists');
      throw new ConflictException('user already exists');
    }
    if (signUpDto.enable2FA && isEmail(signUpDto.data2FA) == false)
      return res.status(HttpStatus.BAD_REQUEST).send('invalid email');
    const duplicated = await this.profileService.getUserProfileByNickname(
      signUpDto.nickname,
    );
    if (duplicated)
      return res.status(HttpStatus.CONFLICT).send('duplicated nickname');
    this.profileService.signUp(signUpDto);
    return res.status(201).send('user creation success');
  }

  @Get('/ladder')
  async refreshLadder(@Req() req, @Res() res) {
    const requserId = req.user.userId;
    const { id, status, nickname, ladder, wins, loses } =
      await this.getUserProfileById(requserId);
    return res
      .status(HttpStatus.OK)
      .send(JSON.stringify({ id, status, nickname, ladder, wins, loses }));
  }
}
