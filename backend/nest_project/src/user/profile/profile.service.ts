import { ConflictException, Injectable } from '@nestjs/common';
import { In, Repository, UpdateResult } from 'typeorm';
import { UserProfile, userStatus } from './user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';

import * as fs from 'fs';
import * as fsp from 'fs/promises';

import * as path from 'path';


import { sign } from 'crypto';
import { extname } from 'path';
import { UserService } from '../../chat/services/user/user.service';
import { UserEntity } from 'src/chat/entities/user.entity';

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
    
    async signUp(signupDto: SignupDto): Promise<void> {
        const { id, nickname, enable2FA, data2FA } = signupDto;
        try {
            console.log(id, nickname, enable2FA, data2FA);
            const userProfile = await this.userProfileRepository.create({
                id, nickname, enable2FA, data2FA, userEntity: null});
            const createdProfile = await this.userProfileRepository.save(userProfile);    
            // UserEntity 생성 && profile에 엔터티 추가 - for chat
            const userEntity = await this.userService.create({ userProfile: createdProfile, id,
                rooms: [], connections: [], joinedRooms: [], messages: []});
            await this.userProfileRepository.update({id: id}, {userEntity: userEntity});
            console.log('wow signup is done! : ', userProfile);
        } catch (error) {
            if (error.code === '23505') { // 중복된 닉네임 처리
                throw new ConflictException('duplicated nickname');
            } else {
                console.log('error in signup : ', error);// 
                throw new Error('unknown error');
            }
        }
    }
                
    async getAllUserProfiles(): Promise<UserProfile[]> {
        return this.userProfileRepository.find();
    }

    async getLadderById(id: number) : Promise<number> {
        const user =  this.userProfileRepository.findOne({where : {id: id}});
        return (await user).ladder;
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

    async updateUserProfileById(id: number, updateDto: UserProfile) {
        return await this.userProfileRepository.update({id}, updateDto); 
        //return await this.getUserProfileById(id);
    }


    async updateUserProfileByNickname(nickname: string, updateDto: UserProfile) {
        return await this.userProfileRepository.update({nickname}, updateDto); 
    }


    async updateAvatar(id : number, avatar : Buffer) : Promise<any> {
        return this.userProfileRepository.update({id: id}, {avatar: avatar});
    }

    async upLadder(id :number) : Promise<UpdateResult> {
        const ladder = (await this.getUserProfileById(id)).ladder;
        return await this.userProfileRepository.update({id: id}, {ladder: (ladder + 100)});
    }

    async downLadder(id :number) : Promise<UpdateResult> {
        const ladder = (await this.getUserProfileById(id)).ladder;
        return await this.userProfileRepository.update({id: id}, {ladder: (ladder - 100)});
    }

    async updateWins(id :number) : Promise<UpdateResult> {
        const wins = (await this.getUserProfileById(id)).wins;
        return await this.userProfileRepository.update({id: id}, {wins: (wins + 1)});
    }

    async updateLoses(id :number) : Promise<UpdateResult> {
        const loses = (await this.getUserProfileById(id)).loses;
        return await this.userProfileRepository.update({id: id}, {loses: (loses + 1)});
    }

}