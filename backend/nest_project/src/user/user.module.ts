import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './profile/user-profile.entity';
import { UserEntity } from '../chat/entities/user.entity';
import { TfaModule } from './tfa/tfa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, UserEntity]),
    ProfileModule,
    AuthModule,
    SocialModule,
    TfaModule
  ],
})
export class UserModule {}