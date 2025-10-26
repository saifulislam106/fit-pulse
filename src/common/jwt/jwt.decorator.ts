import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RequestWithUser } from './jwt.interface';
import { JwtAuthGuard, RolesGuard } from './jwt.guard';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export function MakePublic() {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

export const GetUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);

export function ValidateAuth(...roles: Role[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

export function ValidateSuperAdmin() {
  return ValidateAuth(Role.SUPER_ADMIN);
}

export function ValidateAdmin() {
  return ValidateAuth(Role.ADMIN, Role.SUPER_ADMIN);
}

export function ValidateAdminOrTrainer() {
  return ValidateAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.TRAINER);
}

export function ValidateTrainer() {
  return ValidateAuth(Role.TRAINER);
}
export function ValidateAllUser() {
  return ValidateAuth(Role.USER, Role.ADMIN, Role.TRAINER, Role.SUPER_ADMIN);
}

export function ValidateUser() {
  return ValidateAuth(Role.USER);
}
