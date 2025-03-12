import { Role } from '../../enums/role.enum';

export class CreateUserInput {
  name: string;
  role: Role;
  email: string;
  password_hash: string;
}
