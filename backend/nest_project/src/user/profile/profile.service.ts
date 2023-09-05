import { ConflictException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';


import * as fs from 'fs';
import * as fsp from 'fs/promises';

import * as path from 'path';


import { sign } from 'crypto';
import { extname } from 'path';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserProfile)
        private userProfileRepository: Repository<UserProfile>,
    ) {}


    async signUp(signupDto: SignupDto, imagePath: string): Promise<void> {
        const { id, nickname, enable2FA, data2FA } = signupDto;
        try {
              const imageBuffer = await fsp.readFile(imagePath);
              const userProfile = await this.userProfileRepository.create({
                  id, nickname, enable2FA, data2FA, avatar: imageBuffer
              });// Buffer 형식으로 이미지 데이터를 저장합니다.
            await this.userProfileRepository.save(userProfile);
            console.log('wow signup is done! : ', userProfile);
          }
          catch (error) {
            if (error.code === '23505') { // 중복된 닉네임 처리
             throw new ConflictException('duplicated nickname');
            } else {
             throw new Error('unknown error');
            }
        }
    }
    
    async getAllUserProfiles(): Promise<UserProfile[]> {
        return this.userProfileRepository.find();
    }

    async getUserProfileById(id: number): Promise<UserProfile> {
        return this.userProfileRepository.findOne({where : {id: id}});
    }

    async getUserProfileByNickname(nickname: string): Promise<UserProfile> {
        return this.userProfileRepository.findOne({where : {nickname: nickname}});
    }

    async deleteUserProfileById(id: number): Promise<void> { // 실제 서비스에서는 사용하지 않을 것이다.
        await this.userProfileRepository.delete({id: id});
    }

    async deleteUserProfileByNickname(nickname: string): Promise<void> { // 실제 서비스에서는 사용하지 않을 것이다.
        await this.userProfileRepository.delete({nickname: nickname});
    }

    async updateUserProfileById(id: number, updateDto: SignupDto): Promise<UserProfile> {
        const { nickname, enable2FA, data2FA } = updateDto;
        const userProfile = await this.getUserProfileById(id);
        userProfile.nickname = nickname;
        userProfile.enable2FA = enable2FA;
        userProfile.data2FA = data2FA;
        await this.userProfileRepository.save(userProfile);
        return userProfile;
    }
    
    async updateUserProfileByNickname(nickname: string, updateDto: SignupDto): Promise<UserProfile> {
        const { id, enable2FA, data2FA } = updateDto;
        const userProfile = await this.getUserProfileByNickname(nickname);
        userProfile.id = id;
        userProfile.enable2FA = enable2FA;
        userProfile.data2FA = data2FA;
        await this.userProfileRepository.save(userProfile);
        return userProfile;
    }

    async storeImage(imageData: string, path : string): Promise<string> {
        const imageBuffer = Buffer.from(imageData, 'base64');
        await new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(path);
            stream.write(imageBuffer);
            stream.end()
            stream.on('finish', resolve);
            stream.on('error', reject);           
        });
        return path;
    }
}