import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Authentication token is invalid or expired. Please login and try again',
      );
    }
    return user;
  }
}
