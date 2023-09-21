import { UserEntity } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { roomType } from "../types/roomTypes";
import { JoinedRoomEntity } from "./joined-room.entity";
import { ConnectedUserEntity } from "./connected-user.entity";

@Entity()
export class RoomEntity {

  @PrimaryGeneratedColumn()
  roomId: number;

  @Column()
  roomName: string;

  @Column()
  roomType: roomType;

  @Column({default: null})
  roomPass: string;

  @Column()
  roomOwner: number;

  @Column({type: 'integer', array: true, default: []})
  roomAdmins: number[];

  @Column({type: 'integer', array: true, default: []})
  roomBanned: number[];

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  users: UserEntity[];

  @OneToMany(() => ConnectedUserEntity, (conncetion) => conncetion.room)
  @JoinTable()
  connections: ConnectedUserEntity[];

  @ManyToMany(() => MessageEntity, message => message.room)
  messages: MessageEntity[];

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  // @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  // joinedUsers: JoinedRoomEntity[];
}