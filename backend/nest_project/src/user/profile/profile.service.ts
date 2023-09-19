import { ConflictException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { UserProfile, userStatus } from './user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';

import * as fs from 'fs';
import * as fsp from 'fs/promises';

import * as path from 'path';


import { sign } from 'crypto';
import { extname } from 'path';
import { UserService } from '../../chat/services/user/user.service';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserProfile)
        private userProfileRepository: Repository<UserProfile>,
        private userService: UserService,
    ) {}

    async logOn(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.online});
    }

    async logOff(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.offline});
    }

    async ingame(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.inGame});
    }

    async inchat(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.inChat});
    }
    // async signUp(signupDto: SignupDto, imagePath: string): Promise<void> {
    //     const { id, nickname, enable2FA, data2FA } = signupDto;
    //     try {
    //         const imageBuffer = await fsp.readFile(imagePath);
    //         const userProfile = await this.userProfileRepository.create({
    //               id, nickname, enable2FA, data2FA, avatar: imageBuffer
    //           });// Buffer 형식으로 이미지 데이터를 저장합니다.
    //         await this.userProfileRepository.save(userProfile);
    //         console.log('wow signup is done! : ', userProfile);
    //       }
    //       catch (error) {
    //         if (error.code === '23505') { // 중복된 닉네임 처리
    //          throw new ConflictException('duplicated nickname');
    //         } else {
    //          throw new Error('unknown error');
    //         }
    //     }
    // }
    async signUp(signupDto: SignupDto): Promise<void> {
        const { id, nickname, enable2FA, data2FA } = signupDto;
        try {
            console.log(id, nickname, enable2FA, data2FA);//
            const userProfile = await this.userProfileRepository.create({
                id, nickname, enable2FA, data2FA, userEntity: null});
            const createdProfile = await this.userProfileRepository.save(userProfile);
            
            // UserEntity 생성 && profile에 엔터티 추가 - for chat
            const userEntity = await this.userService.create({ userProfile: createdProfile, id,
                nickname, block_list: [], rooms: [], connections: [], joinedRooms: [], messages: []});
            await this.userProfileRepository.update({id: id}, {userEntity: userEntity});

            console.log('wow signup is done! : ', userProfile);
          }
          catch (error) {
            if (error.code === '23505') { // 중복된 닉네임 처리
             throw new ConflictException('duplicated nickname');
            } else {
            console.log('error in signup : ', error);// 
             throw new Error('unknown error');
            }
        }
    }

    // async saveAvatar(id: number, imagePath: string): Promise<void> {
    //     try {
    //         const imageBuffer = await fsp.readFile(imagePath);
    //         await this.userProfileRepository.update({id: id}, {avatar: imageBuffer});
    //         console.log(`wow saveAvatar is done! : ${id}`);
    //     }
    //     catch (error) {
    //         console.log('error in saveAvatar : ', error);
    //         throw new Error('error in saveAvatar');
    //     }
    // }
    
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

    async updateAvatar(id : number, avatar : Buffer) : Promise<any> {
        return this.userProfileRepository.update({id: id}, {avatar: avatar});
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

    // async storeImage(imageData: string, path : string): Promise<string> {
    //     const imageBuffer = Buffer.from(imageData, 'base64');
    //     await new Promise((resolve, reject) => {
    //         const stream = fs.createWriteStream(path);
    //         stream.write(imageBuffer);
    //         stream.end()
    //         stream.on('finish', resolve);
    //         stream.on('error', reject);           
    //     });
    //     return path;
    // }
}