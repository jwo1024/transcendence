import { UserEntity } from "./user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
// import { UserI } from "../interfaces/user.interface";
import { roomType } from "../types/roomTypes";
import { JoinedRoomEntity } from "./joined-room.entity";

// interface RoomInfo {
// 	roomNumber: number; !!!
// 	roomName: string; !!!!
// 	roomType: roomType; 
// 	roomMembers: Record<number, RoomMember>;
// 	roomOwner: number;
// 	roomAdmins: number[];
// 	bannedUsers: number[];
// 	roomPass?: string;
// }

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
  roomAdmins: Map<number, void>;

  @Column()
  roomBanned: Map<number, void>;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedUsers: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.room)
  messages: MessageEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}