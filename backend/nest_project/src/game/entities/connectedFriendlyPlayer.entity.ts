import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
export class ConnectedFriendlyPlayerEntity {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column()
  socketId: string;

  @Column()
  hostId: number;

  @Column()
  guestId: number;

  @Column()
  refuseGame: boolean = false;

  @Column()
  checkRefuseTimer: NodeJS.Timeout;

}