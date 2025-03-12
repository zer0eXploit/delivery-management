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

import { DeliveryPerson } from './delivery-person.entity';
import { DeliveryRequest } from '../../delivery-requests/entities/delivery-request.entity';

import { JobType } from '../../enums/job-type.enum';
import { JobStatus } from '../../enums/delivery-job-status.enum';

registerEnumType(JobType, { name: 'JobType' });
registerEnumType(JobStatus, { name: 'JobStatus' });

@Entity()
@ObjectType()
export class DeliveryJob {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => DeliveryPerson)
  @ManyToOne(() => DeliveryPerson, (person) => person.delivery_jobs)
  @JoinColumn({ name: 'delivery_person_id' })
  delivery_person: DeliveryPerson;

  @Field(() => DeliveryRequest)
  @ManyToOne(() => DeliveryRequest)
  @JoinColumn({ name: 'delivery_request_id' })
  delivery_request: DeliveryRequest;

  @Field(() => JobType)
  @Column({
    type: 'enum',
    enum: JobType,
  })
  job_type: JobType;

  @Field(() => JobStatus)
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ASSIGNED,
  })
  status: JobStatus;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
    default:
      'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=500',
  })
  signature_url: string;

  @Field()
  @Column('numeric', { precision: 10, scale: 2 })
  earning: number;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
