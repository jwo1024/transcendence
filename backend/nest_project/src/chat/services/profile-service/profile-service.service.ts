// import { ConflictException, Injectable } from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';

// //DTOs
// import { SignupDto } from '../../dto/signup.dto';

// //Entities
// // import { UserProfile } from '../../entities/userprofile.entity';
// import { UserEntity } from '../../entities/user.entity';
// // import { UserProfile } from '../../entities/userprofile.entity';

// // UserProfile

// @Injectable()
// export class ProfileService {
//     constructor(
//         @InjectRepository(UserProfile)
//         private userProfileRepository: Repository<UserProfile>,
//         @InjectRepository(UserEntity)
//         private userEntityRepository : Repository<UserEntity>,
// 		) {}

//     async signUp(signupDto : SignupDto): Promise<UserProfile> {
//         const { id, nickname, enable2FA, data2FA } = signupDto;

//         const userProfile = this.userProfileRepository.create({id, nickname, enable2FA, data2FA});
//         try {
//             await this.userProfileRepository.save(userProfile);
//         } catch (error) {
//             if (error.code === '23505') // duplicate username
//                 throw new ConflictException('duplicate nickname');
//             else
//                 throw new Error('unknown error');
//         }
// 		const userEntity = this.userEntityRepository.create({ id, nickname});
// 		try {
//             await this.userEntityRepository.save(userEntity);
//         } catch (error) {
//             if (error.code === '23505') // duplicate username
//                 throw new ConflictException('duplicate nickname');
//             else
//                 throw new Error('unknown error');
//         }
//         return userProfile;
//     }

//     async getAllUserProfiles(): Promise<UserProfile[]> {
//         return this.userProfileRepository.find();
//     }

//     async getUserProfileById(id: number): Promise<UserProfile> {
//         return this.userProfileRepository.findOne({where : {id: id}});
//     }

//     async getUserProfileByNickname(nickname: string): Promise<UserProfile> {
//         return this.userProfileRepository.findOne({where : {nickname: nickname}});
//     }

//     async deleteUserProfileById(id: number): Promise<void> { // 실제 서비스에서는 사용하지 않을 것이다.
//         await this.userProfileRepository.delete({id: id});
//     }

//     async deleteUserProfileByNickname(nickname: string): Promise<void> { // 실제 서비스에서는 사용하지 않을 것이다.
//         await this.userProfileRepository.delete({nickname: nickname});
//     }

//     async updateUserProfileById(id: number, updateDto: SignupDto): Promise<UserProfile> {
//         const { nickname, enable2FA, data2FA } = updateDto;
//         const userProfile = await this.getUserProfileById(id);
//         userProfile.nickname = nickname;
//         userProfile.enable2FA = enable2FA;
//         userProfile.data2FA = data2FA;
//         await this.userProfileRepository.save(userProfile);
//         return userProfile;
//     }

//     async updateUserProfileByNickname(nickname: string, updateDto: SignupDto): Promise<UserProfile> {
//         const { id, enable2FA, data2FA } = updateDto;
//         const userProfile = await this.getUserProfileByNickname(nickname);
//         userProfile.id = id;
//         userProfile.enable2FA = enable2FA;
//         userProfile.data2FA = data2FA;
//         await this.userProfileRepository.save(userProfile);
//         return userProfile;
//     }
// }
