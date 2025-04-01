import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  telegram_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 30 })
  role: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
