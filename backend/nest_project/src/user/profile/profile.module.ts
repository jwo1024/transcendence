import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { UserEntity } from '../../chat/entities/user.entity';
import { UserService } from '../../chat/services/user/user.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './images'
    }),
    TypeOrmModule.forFeature([UserProfile, UserEntity]), AuthModule, ConfigModule],
  controllers: [ProfileController],
  providers: [ProfileService, UserService, JwtStrategy]
})
export class ProfileModule {}
