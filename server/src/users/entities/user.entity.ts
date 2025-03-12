import {
  Index,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { Role } from '../../enums/role.enum';

registerEnumType(Role, { name: 'Role' });

@Entity()
@ObjectType()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field()
  @Index(['email'], { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Field()
  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
