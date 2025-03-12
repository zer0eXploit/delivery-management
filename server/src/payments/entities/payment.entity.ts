import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { DeliveryRequest } from '../../delivery-requests/entities/delivery-request.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity()
@ObjectType()
export class Payment {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  stripe_payment_intent_id: string;

  @Field()
  @Column()
  client_secret: string;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  amount: number;

  @Field()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Field(() => DeliveryRequest)
  @OneToOne(() => DeliveryRequest)
  @JoinColumn({ name: 'delivery_request_id' })
  delivery_request: DeliveryRequest;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
