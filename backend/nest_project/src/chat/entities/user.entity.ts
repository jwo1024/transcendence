import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
// import { Entity, Column, ManyToMany, OneToMany, BeforeUpdate } from "typeorm";
import { UserProfile } from "./userprofile.entity";
import { RoomEntity } from "./room.entity";
import { ConnectedUserEntity } from "./connected-user.entity";
import { JoinedRoomEntity } from "./joined-room.entity";
import { MessageEntity } from "./message.entity";
import { FindOneOptions } from "typeorm";


@Entity()
export class UserEntity {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column({unique: true})
  nick_name: string;

  @Column()
  block_list : number[];
  
  @Column()
  friend_list : number[];

//   @Column()
//   socket?: Socket;

  @ManyToMany(() => RoomEntity, room => room.users)
  rooms: RoomEntity[]

  @OneToMany(() => ConnectedUserEntity, connection => connection.user)
  connections: ConnectedUserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedRooms: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.user)
  messages: MessageEntity[];


  // UserProfile의 변경이 감지되면 UserEntity도 동기화하는 메서드
//   @BeforeUpdate()
//   async syncWithUserProfile() {
// 	const options: FindOneOptions<UserProfile> = {
// 		where: {
// 		  id: this.id,
// 		},
// 	  };
// 	  const userProfile = await UserProfile.findOne(options);

//     if (userProfile) {
//       this.nick_name = userProfile.nickname;
//       this.block_list = userProfile.block_list;
//       this.friend_list = userProfile.friend_list;
//       // ... 다른 필드도 동기화 가능
//     }
//   }

  @BeforeInsert()
  @BeforeUpdate()
  async updateUserProfile() {
    const options: FindOneOptions<UserProfile> = {
		where: {
		  id: this.id,
		},
	  };
	  const userProfile = await UserProfile.findOne(options);

	// const userProfile = await UserProfile.findOne({ id: this.id });

    if (userProfile) {
      userProfile.block_list = this.block_list;
      userProfile.friend_list = this.friend_list;
      await userProfile.save();
    }
  }
}
