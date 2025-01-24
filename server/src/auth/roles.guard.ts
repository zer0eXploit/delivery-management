/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import Constants from '../constants';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      Constants.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context).getContext();
    const { user } = ctx.req;

    return requiredRoles.some((role) => user.role === role);
  }
}
