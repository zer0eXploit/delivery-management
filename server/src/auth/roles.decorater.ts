import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

import Constants from '../constants';

export const Roles = (...roles: Role[]) =>
  SetMetadata(Constants.ROLES_KEY, roles);
