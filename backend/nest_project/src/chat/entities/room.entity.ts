import { UserEntity } from "./user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { roomType } from "../types/roomTypes";
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
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => ConnectedUserEntity, (conncetion) => conncetion.room)
  @JoinTable()
  connections: ConnectedUserEntity[];

  @ManyToMany(() => MessageEntity, message => message.room, {cascade : true})
  @JoinTable()
  messages: MessageEntity[];

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;
}