import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { AuthModule } from 'src/auth/auth.module';

import { ChatGateway } from './chat.gateway';

//Entities
import { RoomEntity } from './entities/room.entity';
import { ConnectedUserEntity } from './entities/connected-user.entity'; 
import { MessageEntity } from './entities/message.entity'; 
import { JoinedRoomEntity } from './entities/joined-room.entity'; 
import { UserEntity } from './entities/user.entity';
import { UserProfile } from './entities/userprofile.entity'; //임시

//Services
import { RoomService } from './services/room/room.service';
import { ConnectedUserService } from './services/connected-user/connected-user.service'; 
import { MessageService } from './services/message/message.service';
import { JoinedRoomService } from './services/joined-room/joined-room.service'; 
import { UserService } from './services/user/user.service';
import { ProfileService } from './services/profile-service/profile-service.service'; // 임시


@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity,
	  UserEntity,
	  UserProfile,
    ])
  ],
  providers: [
	ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, 
	MessageService, UserService, ProfileService,
]
})
export class ChatModule { }
