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

  @Column()
  isPublic: boolean;

  @Column()
  roomPass?: string;

  @Column()
  roomOwner: number;

  @Column()
  roomAdmins: number[];

  @Column()
  roomBanned: number[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedUsers: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.room)
  messages: MessageEntity[];

  @CreateDateColumn()
  created_at: Date;

  // @UpdateDateColumn()
  // updated_at: Date;

}