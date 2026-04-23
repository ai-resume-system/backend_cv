import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserRole } from '../constants/enum/user.enum';
import { BaseUsecase } from '../base/base.usecase';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard extends BaseUsecase implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super(new Logger(RolesGuard.name));
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const roles = this.reflector.getAllAndOverride<EUserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!roles) return true;

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || !user.role) {
        throw new HttpException(
          ERROR_CODES.ROLE_UNABLE_TO_DETERMINE,
          HttpStatus.FORBIDDEN,
        );
      }

      const hasRole = roles.includes(user.role);

      if (!hasRole) {
        throw new HttpException(
          ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS,
          HttpStatus.FORBIDDEN,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`[RolesGuard]: ${error.message}`);
      throw new HttpException(
        ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
