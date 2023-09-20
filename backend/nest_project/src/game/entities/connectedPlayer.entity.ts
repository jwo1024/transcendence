// todo: ConnectedPlayerEntity 필요 없을 것 같음 -> 나중에 삭제

import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
// @Unique('id')
// export class ConnectedPlayerEntity extends BaseEntity {
export class ConnectedPlayerEntity {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column()
  socketId: string;

}