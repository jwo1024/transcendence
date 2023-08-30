import { TypeOrmModule } from "@nestjs/typeorm";
import { Common } from "./common.entity"; 
import { UserProfile } from "src/user/profile/user-profile.entity";

export const typeORMConfig : TypeOrmModule = {
	logging: true,

	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT, 10),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
// entities: [__dirname + '/../**/*.entity.{js,ts}'],
	entities: [Common, UserProfile],
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