import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { DeliveryJob } from './delivery-job.entity';
import { User } from '../../users/entities/user.entity';

import { AvailabilityStatus } from '../../enums/availability-status.enum';

registerEnumType(AvailabilityStatus, { name: 'AvailabilityStatus' });

@Entity()
@ObjectType()
export class DeliveryPerson {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  telegram_id: string;

  @Field(() => AvailabilityStatus)
  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availability_status: AvailabilityStatus;

  @Field(() => [DeliveryJob])
  @OneToMany(() => DeliveryJob, (job) => job.delivery_person)
  delivery_jobs: DeliveryJob[];
}
