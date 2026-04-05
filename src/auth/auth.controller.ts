import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { GetUser } from './decorators/get-user.decorator';

/**
 * Authentication Controller
 * 
 * Provides HTTP endpoints for user authentication and authorization.
 * Handles user registration, login, token management, and profile retrieval.
 * All endpoints return standardized responses and handle errors gracefully.
 * 
 * Routes:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Authenticate user with credentials
 * - POST /api/auth/refresh - Get new access token using refresh token
 * - GET /api/auth/me - Get current authenticated user profile
 */
@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * 
   * Creates a new user with the provided credentials and returns JWT tokens
   * for immediate authentication. The endpoint is public (no auth required).
   * 
   * @param {RegisterDto} registerDto - Registration data (email, password, firstName, lastName)
   * @returns {Promise<AuthResponseDto>} Auth response with tokens and user info
   * @throws {BadRequestException} If email already exists or validation fails
   * 
   * HTTP Status Codes:
   * - 201: User successfully created
   * - 400: Validation error or duplicate email
   * 
   * @example
   * POST /api/auth/register
   * {
   *   "email": "user@example.com",
   *   "password": "Password123",
   *   "firstName": "John",
   *   "lastName": "Doe"
   * }
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticate user with email and password
   * 
   * Validates user credentials and returns JWT tokens if authentication succeeds.
   * The endpoint is public (no auth required). Updates the user's last login timestamp.
   * 
   * @param {LoginDto} loginDto - Login credentials (email and password)
   * @returns {Promise<AuthResponseDto>} Auth response with tokens and user info
   * @throws {BadRequestException} If validation fails
   * @throws {UnauthorizedException} If email not found or password incorrect
   * 
   * HTTP Status Codes:
   * - 200: Login successful
   * - 400: Validation error
   * - 401: Invalid credentials
   * 
   * @example
   * POST /api/auth/login
   * {
   *   "email": "user@example.com",
   *   "password": "Password123"
   * }
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token using refresh token
   * 
   * Generates a new access token using the provided refresh token.
   * This allows users to renew their session without providing credentials again.
   * The endpoint is public but should be called by authenticated clients.
   * 
   * @param {string} refreshToken - Valid JWT refresh token from previous authentication
   * @returns {Promise<Object>} Response object containing the new accessToken
   * @throws {BadRequestException} If refresh token is missing or invalid format
   * @throws {UnauthorizedException} If refresh token is invalid or expired
   * 
   * HTTP Status Codes:
   * - 200: Token refreshed successfully
   * - 400: Refresh token is required
   * - 401: Invalid or expired refresh token
   * 
   * @example
   * POST /api/auth/refresh
   * {
   *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Refresh token is required' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const accessToken = await this.authService.refreshToken(refreshToken);
    return { accessToken };
  }

  /**
   * Get current authenticated user's profile
   * 
   * Returns the profile information of the currently authenticated user.
   * This endpoint requires a valid JWT access token in the Authorization header.
   * The token is automatically parsed and the user ID is extracted via the @GetUser decorator.
   * 
   * @param {Object} user - Authenticated user object (injected via @GetUser decorator)
   * @param {string} user.sub - User ID from JWT token
   * @returns {Promise<CurrentUserDto>} User profile with id, email, firstName, lastName, createdAt
   * @throws {UnauthorizedException} If token is missing, invalid, or user not found
   * 
   * HTTP Status Codes:
   * - 200: User profile retrieved successfully
   * - 401: Unauthorized - Invalid or missing token
   * 
   * @example
   * GET /api/auth/me
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getCurrentUser(@GetUser() user: any) {
    return this.authService.getCurrentUser(user.sub);
  }
}

