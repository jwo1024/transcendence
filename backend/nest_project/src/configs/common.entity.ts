import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm";
// import { BoardStatus } from "./board.model";

@Entity()
export class Common extends BaseEntity {
	@PrimaryGeneratedColumn()
	id:number;

	@Column()
	title: string;

	@Column()
	description: string;

// 	@Column()
// 	status: BoardStatus;
}