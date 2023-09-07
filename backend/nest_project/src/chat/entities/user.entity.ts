import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
// import { Entity, Column, ManyToMany, OneToMany, BeforeUpdate } from "typeorm";
import { UserProfile } from "./userprofile.entity";
import { RoomEntity } from "./room.entity";
import { ConnectedUserEntity } from "./connected-user.entity";
import { JoinedRoomEntity } from "./joined-room.entity";
import { MessageEntity } from "./message.entity";
import { FindOneOptions } from "typeorm";


@Entity()
export class UserEntity {

  // @ManyToOne(() => UserProfile)
  //   @JoinColumn({ name: 'user_profile_id' }) // 외래키 컬럼 이름
  //   userProfile: UserProfile;

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false}) //외래키 한번에 지정 할 수 있나?
  id: number;

  @Column({unique: true})
  nickname: string;

  @Column({ type: 'integer', array: true, default: []})
  block_list : number[];
  
  @Column({ type: 'integer', array: true, default: []})
  friend_list : number[];

  @ManyToMany(() => RoomEntity, room => room.users)
  rooms: RoomEntity[]

  @OneToMany(() => ConnectedUserEntity, connection => connection.user)
  connections: ConnectedUserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedRooms: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.user)
  messages: MessageEntity[];


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
}
