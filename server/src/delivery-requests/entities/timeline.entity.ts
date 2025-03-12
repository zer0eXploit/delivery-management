import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

import { DeliveryRequest } from './delivery-request.entity';

import { DeliveryStatus } from '../../enums/delivery-status.enum';

@Entity()
@ObjectType()
export class Timeline {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => DeliveryRequest)
  @ManyToOne(() => DeliveryRequest)
  @JoinColumn({ name: 'delivery_request_id' })
  delivery_request: DeliveryRequest;

  @Field(() => DeliveryStatus)
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
  })
  status: DeliveryStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
