// from surlee sama

import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
export class User {

  @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
  id: number;

  @Column({unique: true})
  nickname: string;

  @Column()
  level: number; // for ladder queue
}