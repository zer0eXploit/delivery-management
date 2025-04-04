/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

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

    const exists = requiredRoles.some((role) => user.role === role);

    if (exists) return true;

    throw new ForbiddenException(
      `Only ${requiredRoles.join(', ')} can access this resource`,
    );
  }
}
