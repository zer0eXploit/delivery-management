import { UseGuards } from '@nestjs/common';
import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { DeliveryPerson } from '../delivery-persons/entities/delivery-person.entity';

import { UsersService } from './users.service';
import { DeliveryPersonsService } from '../delivery-persons/delivery-persons.service';

import { Roles } from '../auth/roles.decorater';
import { RolesGuard } from '../auth/roles.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

import { Role } from '../enums/role.enum';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly deliveryPersonsService: DeliveryPersonsService,
  ) {}

  @Roles(Role.Admin)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @ResolveField(() => DeliveryPerson, { nullable: true })
  async delivery_person(@Parent() user: User) {
    if (user.role !== Role.Deliverer) {
      return null;
    }
    return this.deliveryPersonsService.findByUserId(user.id);
  }
}
