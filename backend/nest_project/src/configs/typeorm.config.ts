import { TypeOrmModule } from "@nestjs/typeorm";
import { Common } from "./common.entity"; 

//Entities
import { UserProfile } from '../user/profile/user-profile.entity'; 
import { RoomEntity } from '../chat/entities/room.entity';
import { ConnectedUserEntity } from '../chat/entities/connected-user.entity'; 
import { MessageEntity } from '../chat/entities/message.entity'; 
import { JoinedRoomEntity } from '../chat/entities/joined-room.entity'; 
import { UserEntity } from '../chat/entities/user.entity';
import { ConnectedPlayerEntity } from "src/game/entities/connectedPlayer.entity";
import { MatchEntity } from "src/game/entities/match.entity";
import { HistoryEntity } from "src/game/entities/history.entity";
import { ConnectedFriendlyPlayerEntity } from "src/game/entities/connectedFriendlyPlayer.entity";
import { InvitationEntity } from "src/game/entities/invitation.entity";

export const typeORMConfig : TypeOrmModule = {
	logging: {
		"logQueries": true,
		"logFailedQueryError": true,
		"logOnlyFailedQueries": true,
		"logLevel": "info", // 로그 레벨 설정 (debug, info, warn, error, query, schema)
		"exclude": ["avatar"] // 로그에서 제외할 칼럼명 추가
	},
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT, 10),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	// entities: [__dirname + '/../**/*.entity.{js,ts}'],
	entities:
	[
				Common, 
				UserProfile,

				//for chat
				RoomEntity,
				ConnectedUserEntity,
				MessageEntity,
				JoinedRoomEntity,
				UserEntity,

				//for game
				ConnectedPlayerEntity,
				ConnectedFriendlyPlayerEntity,
				MatchEntity,
				HistoryEntity,
				InvitationEntity,
	],

	synchronize: true
}

// export const userTypeORMconf: TypeOrmModuleOptions = {
// 	type: 'postgres',
// 	host: process.env.POSTGRES_HOST,
// 	port: parseInt(process.env.POSTGRES_PORT, 10),
// 	username: process.env.POSTGRES_USER,
// 	password: process.env.POSTGRES_PASSWORD,
// 	database: process.env.POSTGRES_DB,
// 	entities: [
// 	  User,
// 	  IsUserAuth,
// 	  ChatRoom,
// 	  ChatBan,
// 	  ChatMember,
// 	  SocketId,
// 	  Record,
// 	  Type,
// 	  Mode,
// 	],
// 	synchronize: true,
// entities: [__dirname + '/../**/*.entity.{js,ts}'],