
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

enum userStatus {
  offline,
  inGame,
  inChat
}

@Entity()
export class UserProfile extends BaseEntity {

  // @OneToOne(() => UserEntity, userEntity => userEntity.userProfile)
  // @JoinColumn()
  // userEntity: UserEntity;

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;
  
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false})
  nickname: string;
  
  @Column({ type: 'enum', enum: userStatus, default: userStatus.offline})
  status: userStatus;
  
//    @Column({ type: 'bytea'})
//    data: Buffer;

@Column({ type: 'boolean', default: false, nullable: false})
enable2FA: boolean;

@Column({ type: 'varchar'})
data2FA: string;

@Column({ type: 'integer', array: true, default: []})
friend_list: number[];

@Column()
block_list : number[];

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
created_at: Date;  

getStatus(): userStatus {
  return this.status;
}

} 

// // import { ConnectedUserEntity } from "src/chat/model/connected-user/connected-user.entity";
// // import { JoinedRoomEntity } from "src/chat/model/joined-room/joined-room.entity";
// // import { MessageEntity } from "src/chat/model/message/message.entity";
// // import { RoomEntity } from "src/chat/model/room/room.entity";
// import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { Socket } from 'Socket.io';

// @Entity()
// export class UserEntity {

//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({unique: true})
//   nick_name: string;

//   @Column({unique: true})
// 	intra_id: string;

//   @Column()
// 	password: string;

//   @Column()
//   block_list : Map<number, void>;
  
//   @Column()
//   follow_list : Map<number, void>;

//   @Column()
//   socket?: Socket;

// }