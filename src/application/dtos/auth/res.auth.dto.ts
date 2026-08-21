export interface IResponseAuthDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
}

export interface IPublicAuthResponseDto {
  accessToken: string;
  expiresIn: number;
  expiresAt: string;
}
