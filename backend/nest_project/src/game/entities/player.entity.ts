// data source 옵션에 추가해줘야 함 -> entities: [/game/user..]

import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
// @Unique('id')
// export class Player extends BaseEntity {
export class Player {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column({unique: true})
  nickname: string;

  @Column()
  level: number; // for ladder queue

  @Column()
  socketId: string;

  // @CreateDateColumn({name: 'create_time'})
  // createTime: Date;

  // @UpdateDateColumn({name: 'update_time'})
  // updateTime: Date;
  
  // @DeleteDateColumn({name: 'delete_time'})
  // deleteTime?: Date | null;
}