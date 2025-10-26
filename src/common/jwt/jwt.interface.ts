import { Request } from 'express';
import { UserRole } from '../enum/user.enum';

export interface RequestWithUser extends Request {
  user?: UserTokenPayload;
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: string;
}

export interface UserTokenPayload {
  roles: UserRole[];
  email: string;
  userId: string;
  [key: string]: unknown;
}
