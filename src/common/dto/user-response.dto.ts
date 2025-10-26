import { GENDER, Role } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  gender: GENDER;

  @Expose()
  name: string;

  //   @Expose()
  //   mobile?: string;

  //   @Expose()
  //   Ethnicity?: string;

  //   @Expose()
  //   profilePic?: string;

  // @Expose()
  // isVerified: boolean;

  // @Expose()
  // isActive: boolean;

  // @Expose()
  // isDeleted: boolean;

  // @Expose()
  // createdAt: Date;

  // @Expose()
  // updatedAt: Date;

  // @Expose()
  // deletedAt?: Date;
}
