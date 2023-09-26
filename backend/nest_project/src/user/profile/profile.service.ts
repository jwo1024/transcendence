import { ConflictException, Injectable } from '@nestjs/common';
import { In, Repository, UpdateResult } from 'typeorm';
import { UserProfile, userStatus } from './user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../../chat/services/user/user.service';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserProfile)
        private userProfileRepository: Repository<UserProfile>,
        private userService: UserService,
    ) {}

    async initUsers() : Promise<void> {
        const result = await this.userProfileRepository.update({}, { status : userStatus.offline} );
        console.log(`result [${new Date()}] `,  result);
        const list = await this.getAllUserProfiles();
        // console.log('=============== initiated user list ===================')
        for (const user of list) {
            const { id , nickname, status } = user;
            // console.log(`[${id}]-${nickname}: ${status == 0 ? 'offine' : 'not offline'}`);
        }
        // console.log('=======================================================')
    }

    async logOn(id: number): Promise<any> {
        if(await this.getUserProfileById(id) != null)
            console.log(`logon start ${(await this.getUserProfileById(id)).status}`);
        await this.userProfileRepository.update({id: id}, {status: userStatus.online});
        if(await this.getUserProfileById(id) != null)
            console.log(`logon end ${(await this.getUserProfileById(id)).status}`);
    }
    
    async logOff(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.offline});
    }

    async ingame(id: number): Promise<void> {
        await this.userProfileRepository.update({id: id}, {status: userStatus.inGame});
    }

    async inchat(id: number): Promise<void> {
        if(await this.getUserProfileById(id) != null)
            console.log(`inchat start ${(await this.getUserProfileById(id)).status}`);
        await this.userProfileRepository.update({id: id}, {status: userStatus.inChat});
        if(await this.getUserProfileById(id) != null)
            console.log(`inchat end ${(await this.getUserProfileById(id)).status}`);
    
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
                rooms: [], connections: undefined, messages: []});
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

    async getUserProfileById(id: number): Promise<UserProfile> {
        return this.userProfileRepository.findOne({where : {id: id}});
    }

    async getUserProfileByNickname(nickname: string): Promise<UserProfile> {
        return this.userProfileRepository.findOne({where : {nickname: nickname}});
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
}
