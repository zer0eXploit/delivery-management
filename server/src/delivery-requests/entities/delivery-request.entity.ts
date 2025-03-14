import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';

import { PaymentMethod } from '../../enums/payment-methods.enum';
import { DeliveryStatus } from '../../enums/delivery-status.enum';

registerEnumType(DeliveryStatus, { name: 'DeliveryStatus' });

@Entity()
@ObjectType()
export class DeliveryRequest {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', unique: true })
  tracking_code: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Field(() => Address)
  @ManyToOne(() => Address)
  @JoinColumn({ name: 'pickup_address_id' })
  pickup_address: Address;

  @Field(() => Address)
  @ManyToOne(() => Address)
  @JoinColumn({ name: 'delivery_address_id' })
  delivery_address: Address;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  weight: number;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  total_cost: number;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  pickup_cost: number;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  delivery_cost: number;

  @Field(() => PaymentMethod)
  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Field(() => DeliveryStatus)
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
