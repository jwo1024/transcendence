import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { ProfileService } from '../profile/profile.service';
import { UserService } from 'src/chat/services/user/user.service';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { UserEntity } from 'src/chat/entities/user.entity';
import { UserProfile } from '../profile/user-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, UserEntity]),
  ProfileModule,
  AuthModule],
  controllers: [SocialController],
  providers: [ProfileService, UserService]
})
export class SocialModule {}
