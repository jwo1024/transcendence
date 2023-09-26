import { UserProfile } from "src/user/profile/user-profile.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
export class HistoryEntity
{
	@PrimaryGeneratedColumn({type: 'integer'}) 
	history_id: number;

	// @ManyToOne(() => UserProfile, (user) => user.id)
	@Column({ type: 'integer', nullable: false })
	win_user_id: number;

	// @ManyToOne(() => UserProfile, (user) => user.id)
	@Column({ type: 'integer', nullable: false })
	lose_user_id: number;

	@Column({ type: 'integer', nullable: false })
	win_score: number = 0;

	@Column({ type: 'integer', nullable: false })
	lose_score: number = 0;

	@CreateDateColumn({name: 'create_time'})
	createTime: Timestamp;
}
