import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity';

import { AddressesService } from './addresses.service';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';

@Resolver(() => Address)
export class AddressesResolver {
  constructor(private readonly addressesService: AddressesService) {}

  @Mutation(() => Address)
  @UseGuards(GqlAuthGuard)
  createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.create(createAddressInput, user);
  }

  @Query(() => [Address])
  @UseGuards(GqlAuthGuard)
  myAddresses(@CurrentUser() user: User) {
    return this.addressesService.findAllByUser(user.id);
  }

  @Query(() => Address)
  @UseGuards(GqlAuthGuard)
  address(@Args('id') id: string) {
    return this.addressesService.findOne(id);
  }

  @Mutation(() => Address)
  @UseGuards(GqlAuthGuard)
  removeAddress(@Args('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.remove(id, user.id);
  }

  @Mutation(() => Address)
  @UseGuards(GqlAuthGuard)
  updateAddress(
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
    @CurrentUser() user: User,
  ) {
    return this.addressesService.update(updateAddressInput, user.id);
  }

  @Mutation(() => Address)
  @UseGuards(GqlAuthGuard)
  deleteAddress(@Args('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.remove(id, user.id);
  }
}
