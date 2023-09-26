import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';
import { UserProfile } from '../profile/user-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserEntity } from '../../chat/entities/user.entity';
import { UserService } from '../../chat/services/user/user.service';
import { TfaService } from '../tfa/tfa.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: Number(configService.get<string>('JWT_EXPIRES_IN')) }
      }),
      inject: [ConfigService],
    })],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, ProfileService, JwtStrategy,UserService, TfaService],
  exports: [JwtStrategy, PassportModule]

})
export class AuthModule {}
