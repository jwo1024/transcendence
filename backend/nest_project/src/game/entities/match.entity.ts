import { Player } from "./player.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {  // -> 그냥 데이터 베이스 match 테이블 쓰면 될 듯!

  @PrimaryGeneratedColumn()
  matchId: number; // === room name

  @Column()
  gameType: string; // ladder, original, custom

  @Column()
  customType?: string; // custom -> [speed, ..]

  @Column()
  winner: number;
}
