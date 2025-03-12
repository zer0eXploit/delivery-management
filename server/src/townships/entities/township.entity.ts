import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@ObjectType()
export class Township {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Field()
  @Column({ type: 'varchar', length: 10 })
  zipcode: string;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  pickup_cost: number;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  delivery_cost: number;
}
