import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { Township } from './entities/township.entity';

import { TownshipsService } from './townships.service';

import { Roles } from '../auth/roles.decorater';
import { RolesGuard } from '../auth/roles.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

import { Role } from '../enums/role.enum';

import { CreateTownshipInput } from './dto/create-township.input';

@Resolver(() => Township)
export class TownshipsResolver {
  constructor(private readonly townshipsService: TownshipsService) {}

  @Mutation(() => Township)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  createTownship(
    @Args('createTownshipInput') createTownshipInput: CreateTownshipInput,
  ) {
    return this.townshipsService.create(createTownshipInput);
  }

  @Query(() => [Township])
  @UseGuards(GqlAuthGuard)
  townships() {
    return this.townshipsService.findAll();
  }

  @Query(() => Township)
  @UseGuards(GqlAuthGuard)
  township(@Args('id') id: string) {
    return this.townshipsService.findOne(id);
  }

  @Mutation(() => Township)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  updateTownship(
    @Args('id') id: string,
    @Args('updateTownshipInput') updateTownshipInput: CreateTownshipInput,
  ) {
    return this.townshipsService.update(id, updateTownshipInput);
  }
}
