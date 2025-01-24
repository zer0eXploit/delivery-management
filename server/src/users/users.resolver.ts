import { UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';

import { Role } from '../enums/role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles.decorater';
import { RolesGuard } from '../auth/roles.guard';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.Admin)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }
}
