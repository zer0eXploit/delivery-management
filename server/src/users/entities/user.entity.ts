import {
  Index,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Index(['email'], { unique: true })
  @Column()
  email: string;

  @Field()
  @Column()
  role: string;

  @Column()
  password_hash: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
