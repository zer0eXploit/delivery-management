import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { Township } from '../../townships/entities/township.entity';

@Entity()
@ObjectType()
export class Address {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'text' })
  address_line: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Field()
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Field()
  @Column({ type: 'text' })
  contact_number: string;

  @Field(() => Township)
  @ManyToOne(() => Township)
  @JoinColumn({ name: 'township_id' })
  township: Township;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date;
}
