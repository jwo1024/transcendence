import { UserEntity } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { roomType } from "../types/roomTypes";
import { JoinedRoomEntity } from "./joined-room.entity";

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

  // @Column({default: -1})
  @Column()
  roomOwner: number;

  @Column({type: 'integer', array: true, default: []})
  roomAdmins: number[];

  @Column({type: 'integer', array: true, default: []})
  roomBanned: number[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedUsers: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.room)
  messages: MessageEntity[];

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

}