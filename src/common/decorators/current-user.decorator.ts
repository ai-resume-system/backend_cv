import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EUserRole } from '../constants/enum/user.enum';

export interface ICurrentUser {
  id: string;
  role: EUserRole;
}

export const REQUEST_RESULT_USER = 'user';

export const AuthCurrentUser = () => {
  return createParamDecorator(
    (_data: unknown, context: ExecutionContext): ICurrentUser => {
      const request = context.switchToHttp().getRequest<Request>();
      return request[REQUEST_RESULT_USER] as ICurrentUser;
    },
  )();
};
