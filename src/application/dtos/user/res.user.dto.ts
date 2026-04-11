export class ResponseUserDto {
  id: string;
  email: string;
  phone?: string;
  status: string;
  role_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserListResponseDto {
  data: ResponseUserDto[];
  total: number;
  page: number;
  limit: number;
}
