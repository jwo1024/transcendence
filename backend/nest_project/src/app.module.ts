// import { Module } from '@nestjs/common';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';

import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig),
            ChatModule,
            GameModule,
            UserModule,
            ConfigModule.forRoot({
              isGlobal: true, // 전역 설정으로 사용
            }),  ],
})
export class AppModule {}
