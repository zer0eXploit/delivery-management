import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Township } from './entities/township.entity';

import { CreateTownshipInput } from './dto/create-township.input';

@Injectable()
export class TownshipsService {
  constructor(
    @InjectRepository(Township)
    private townshipRepository: Repository<Township>,
  ) {}

  create(createTownshipInput: CreateTownshipInput) {
    const township = this.townshipRepository.create(createTownshipInput);
    return this.townshipRepository.save(township);
  }

  findAll() {
    return this.townshipRepository.find();
  }

  async findOne(id: string) {
    const township = await this.townshipRepository.findOneBy({ id });
    if (!township) {
      throw new NotFoundException('Township not found');
    }
    return township;
  }

  async update(id: string, updateTownshipInput: Partial<CreateTownshipInput>) {
    const township = await this.findOne(id);
    Object.assign(township, updateTownshipInput);
    return this.townshipRepository.save(township);
  }
}
