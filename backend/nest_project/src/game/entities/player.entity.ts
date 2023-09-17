// todo: PlayerEntity 필요 없을 것 같음 -> 나중에 삭제

import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
// @Unique('id')
// export class PlayerEntity extends BaseEntity {
export class PlayerEntity {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column({unique: true})
  nickname: string;

  @Column()
  ladder: number; // for ladder queue

  @Column()
  socketId: string;

  // User or UserProfile과 외래키로 연걸
  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;

  // @CreateDateColumn({name: 'create_time'})
  // createTime: Date;

  // @UpdateDateColumn({name: 'update_time'})
  // updateTime: Date;
  
  @DeleteDateColumn({name: 'delete_time'})
  deleteTime?: Date | null;
}