import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoomEntity } from "./room.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class MessageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => UserEntity, user => user.messages)
  @JoinColumn()
  user: UserEntity;

  // @ManyToOne(() => RoomEntity, room => room.messages, {onDelete: 'CASCADE',})
  @ManyToOne(() => RoomEntity, room => room.messages)
  @JoinColumn()
  room: RoomEntity;

  @CreateDateColumn()
  created_at: Date;

}