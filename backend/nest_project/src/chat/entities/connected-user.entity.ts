import { RoomEntity } from "./room.entity";
import { UserEntity } from "./user.entity"; 
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @OneToOne(() => UserEntity, user => user.connection)
  @JoinColumn()
  user: UserEntity;

  @ManyToMany(() => RoomEntity, room => room.connections)
  rooms : RoomEntity[];
}