import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, OneToOne, JoinTable } from "typeorm";
import { UserProfile } from "../../user/profile/user-profile.entity";
import { RoomEntity } from "./room.entity";
import { ConnectedUserEntity } from "./connected-user.entity";
import { JoinedRoomEntity } from "./joined-room.entity";
import { MessageEntity } from "./message.entity";

@Entity()
export class UserEntity {

  @OneToOne(() => UserProfile)
  @JoinColumn({ name: 'user_profile_id' }) // 외래키 컬럼 이름
  userProfile: UserProfile;

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false}) //외래키 한번에 지정 할 수 있나?
  id: number;

  @ManyToMany(() => RoomEntity, room => room.users)
  @JoinTable()
  rooms: RoomEntity[];

  @OneToOne(() => ConnectedUserEntity, connection => connection.user)
  connection: ConnectedUserEntity;
  
  @OneToMany(() => MessageEntity, message => message.user)
  messages: MessageEntity[];

  // @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  // joinedRooms: JoinedRoomEntity[] = [];
}

// @OneToOne(() => ConnectedUserEntity, (connection) => connection.user, {
//   eager: true,
// })
// @JoinTable()
// connection: ConnectedUserEntity;

  // @OneToOne(() => ConnectedUserEntity, connection => connection.user)
  // connection: ConnectedUserEntity;


  // @OneToMany(() => MessageEntity, message => message.user)
  // messages: MessageEntity[] = [];

  //갱신을 위한 메서드 잠시 보류
  // @BeforeInsert()
  // @BeforeUpdate()
  // async updateUserProfile() {
  //   const options: FindOneOptions<UserProfile> = {
	// 	where: {
	// 	  id: this.id,
	// 	},
	//   };
	//   const userProfile = await UserProfile.findOne(options);

	// // const userProfile = await UserProfile.findOne({ id: this.id });

  //   if (userProfile) {
  //     userProfile.block_list = this.block_list;
  //     userProfile.friend_list = this.friend_list;
  //     await userProfile.save();
  //   }
  // }
