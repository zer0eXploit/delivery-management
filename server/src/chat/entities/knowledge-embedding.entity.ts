import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class KnowledgeEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  embedding: string;

  @Column('text')
  original_text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
