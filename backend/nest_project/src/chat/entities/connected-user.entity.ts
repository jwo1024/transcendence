import { RoomEntity } from "./room.entity";
import { UserEntity } from "./user.entity"; 
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

// @Entity(({ name: 'connected_user_entity' }))
@Entity()
export class ConnectedUserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @OneToOne(() => UserEntity, user => user.connection)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.connections)
  @JoinColumn()
  room : RoomEntity;
}