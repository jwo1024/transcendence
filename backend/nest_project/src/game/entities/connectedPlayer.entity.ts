import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
export class ConnectedPlayerEntity {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column()
  socketId: string;

}