import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

import { User } from '../../../users/entities/user.entity';

@ObjectType()
@Entity()
export class TwoFactorToken {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  token: string;

  @Field()
  @Column()
  expires_at: Date;

  @Field()
  @Column({ default: false })
  is_used: boolean;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @CreateDateColumn()
  created_at: Date;
}
