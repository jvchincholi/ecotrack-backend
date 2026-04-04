import { ApiProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
  sub: string; // userId
  email: string;
  iat: number; // issued at
  exp: number; // expiration
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', description: 'User ID' },
      email: { type: 'string', description: 'User email' },
      firstName: { type: 'string', description: 'User first name' },
      lastName: { type: 'string', description: 'User last name' },
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class CurrentUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;
}
