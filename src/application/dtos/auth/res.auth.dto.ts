import { EUserRole } from 'src/common/constants/enum/user.enum';

export interface IResponseAuthDto {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    role: EUserRole;
  };
}
