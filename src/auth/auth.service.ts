import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, TokenPayloadDto } from './dto/auth-response.dto';

/**
 * Authentication Service
 * 
 * Handles all authentication-related operations including user registration, login,
 * token generation, and refresh token management. Integrates with UsersService
 * for user management and JwtService for token generation.
 * 
 * @class AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Register a new user with email and password
   * 
   * Creates a new user account and generates JWT tokens for authentication.
   * Password must meet security requirements: minimum 8 characters with lowercase,
   * uppercase, and numeric characters.
   * 
   * @param {RegisterDto} registerDto - User registration data including email, password, firstName, lastName
   * @returns {Promise<AuthResponseDto>} Authentication response containing accessToken, refreshToken, and user info
   * @throws {BadRequestException} If email already exists or validation fails
   * @throws {InternalServerErrorException} If user creation fails
   * 
   * @example
   * const response = await authService.register({
   *   email: 'user@example.com',
   *   password: 'Password123',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   * // Returns { accessToken: 'jwt...', refreshToken: 'jwt...', user: {...} }
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Authenticate a user with email and password
   * 
   * Validates user credentials against stored hashed password and generates new JWT tokens.
   * Updates the user's lastLoginAt timestamp on successful authentication.
   * 
   * @param {LoginDto} loginDto - Login credentials containing email and password
   * @returns {Promise<AuthResponseDto>} Authentication response containing accessToken, refreshToken, and user info
   * @throws {UnauthorizedException} If email not found or password is incorrect
   * @throws {InternalServerErrorException} If database operation fails
   * 
   * @example
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'Password123'
   * });
   * // Returns { accessToken: 'jwt...', refreshToken: 'jwt...', user: {...} }
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Validate user credentials
   * 
   * Checks if a user exists with the provided email and verifies the password
   * matches the stored hashed password using bcrypt comparison.
   * 
   * @param {string} email - User email address
   * @param {string} password - Plain text password to validate
   * @returns {Promise<Object | null>} User object with id, email, firstName, lastName if valid, null otherwise
   * @throws {UnauthorizedException} If email not found or password invalid
   * 
   * @example
   * const user = await authService.validateUser('user@example.com', 'Password123');
   * // Returns { id: 'uuid', email: 'user@example.com', firstName: 'John', lastName: 'Doe' }
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; firstName: string; lastName: string } | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  /**
   * Generate JWT access and refresh tokens
   * 
   * Creates a pair of JWT tokens:
   * - Access Token: Short-lived token (default 1 hour) for API authentication
   * - Refresh Token: Long-lived token (default 7 days) for obtaining new access tokens
   * 
   * Token expiration times are configurable via environment variables:
   * - JWT_EXPIRATION: Access token TTL (default: '3600s')
   * - JWT_REFRESH_EXPIRATION: Refresh token TTL (default: '604800s')
   * 
   * @param {Object} payload - Token payload containing user identification
   * @param {string} payload.sub - User ID (subject claim)
   * @param {string} payload.email - User email address
   * @returns {Promise<Object>} Object containing accessToken and refreshToken strings
   * @throws {Error} If JWT signing fails
   * 
   * @example
   * const tokens = await authService.generateTokens({
   *   sub: 'user-uuid',
   *   email: 'user@example.com'
   * });
   * // Returns { accessToken: 'eyJhbGc...', refreshToken: 'eyJhbGc...' }
   */
  async generateTokens(payload: {
    sub: string;
    email: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_EXPIRATION || '3600s',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '604800s',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh expired access token using refresh token
   * 
   * Validates the provided refresh token and generates a new access token.
   * This allows users to maintain their session without re-entering credentials.
   * Refresh token must be valid, not expired, and belong to an existing user.
   * 
   * @param {string} refreshToken - Valid JWT refresh token
   * @returns {Promise<string>} New access token
   * @throws {UnauthorizedException} If refresh token is invalid, expired, or user not found
   * 
   * @example
   * const newAccessToken = await authService.refreshToken(
   *   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * );
   * // Returns new access token string
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: process.env.JWT_EXPIRATION || '3600s',
        },
      );

      return accessToken;
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Retrieve current authenticated user's profile
   * 
   * Fetches the user profile from the database using the user ID extracted
   * from the JWT token. Used by the GET /api/auth/me endpoint to return
   * the authenticated user's information.
   * 
   * @param {string} userId - User ID from JWT token subject claim
   * @returns {Promise<CurrentUserDto>} User profile containing id, email, firstName, lastName, and createdAt
   * @throws {UnauthorizedException} If user not found in database
   * 
   * @example
   * const user = await authService.getCurrentUser('550e8400-e29b-41d4-a716-446655440000');
   * // Returns { id: '550e8400...', email: 'user@example.com', firstName: 'John', lastName: 'Doe', createdAt: Date }
   */
  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
