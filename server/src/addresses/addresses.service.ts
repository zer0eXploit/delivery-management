import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import parsePhoneNumber from 'libphonenumber-js';
import { InjectRepository } from '@nestjs/typeorm';

import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity';

import { UsersService } from '../users/users.service';
import { TownshipsService } from '../townships/townships.service';

import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private usersService: UsersService,
    private townshipsService: TownshipsService,
  ) {}

  async create(createAddressInput: CreateAddressInput, user: User) {
    const township = await this.townshipsService.findOne(
      createAddressInput.township_id,
    );

    const parsedNumber = parsePhoneNumber(
      createAddressInput.contact_number,
      'MM',
    );

    if (!parsedNumber) throw new Error('Invalid phone number');

    createAddressInput.contact_number = parsedNumber.formatInternational();

    const address = this.addressRepository.create({
      ...createAddressInput,
      township,
      user,
    });

    return this.addressRepository.save(address);
  }

  findAllByUser(userId: string) {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      relations: ['township'],
      withDeleted: false,
    });
  }

  async findOne(id: string) {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['township', 'user'],
      withDeleted: false,
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(updateAddressInput: UpdateAddressInput, userId: string) {
    const address = await this.findOne(updateAddressInput.id);

    if (address.user.id !== userId) {
      throw new ForbiddenException('Cannot update this address');
    }

    if (updateAddressInput.township_id) {
      const township = await this.townshipsService.findOne(
        updateAddressInput.township_id,
      );
      address.township = township;
    }

    if (updateAddressInput.address_line) {
      address.address_line = updateAddressInput.address_line;
    }

    if (updateAddressInput.contact_number) {
      address.contact_number = updateAddressInput.contact_number;
    }

    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id);

    if (address.user.id !== userId) {
      throw new ForbiddenException('Cannot delete this address');
    }

    return this.addressRepository.softRemove(address);
  }
}
