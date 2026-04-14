import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './role.decorator';
import { EUserRole } from '../constants/enum/user.enum';
import { AuthenticationGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';

export function AuthRequired(...roles: EUserRole[]) {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    UseGuards(AuthenticationGuard, RolesGuard),
    roles.length ? Roles(...roles) : () => {},
  );
}
