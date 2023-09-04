import { User } from "./user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {

  @PrimaryGeneratedColumn()
  matchId: number; // === room name

  @Column()
  gameType: string; // ladder, original, custom

  @Column()
  customType?: string; // custom -> [speed, ..]

  @Column()
  winner: number;
}