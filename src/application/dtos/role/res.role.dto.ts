import { ApiProperty } from '@nestjs/swagger';

export class ResponseRoleDto {
  id: string;
  roleName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
