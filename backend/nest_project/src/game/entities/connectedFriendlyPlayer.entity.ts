import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
export class ConnectedFriendlyPlayerEntity
{

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column()
  socketId: string;

  @Column()
  hostId: number = 0;

  @Column()
  guestId: number = 0;

  // @Column()
  // invitation_id: number = 0;

  @Column()
  refuseGame: boolean = false;

  @Column()
  checkTimer: number = 0;

}