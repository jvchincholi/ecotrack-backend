import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword123456789',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    hashPasswordOnInsert: jest.fn(),
    hashPasswordOnUpdate: jest.fn(),
  };

  const mockAuthResponse = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should return 201 status (handled by NestJS)', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw BadRequestException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should pass all DTO fields to auth service', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'FirstName',
        lastName: 'LastName',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: registerDto.password,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle login attempt with nonexistent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token when refresh token is valid', async () => {
      mockAuthService.refreshToken.mockResolvedValue('mock.access.token');

      const result = await controller.refresh('mock.refresh.token');

      expect(authService.refreshToken).toHaveBeenCalledWith('mock.refresh.token');
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock.access.token');
    });

    it('should throw BadRequestException if refresh token is missing', async () => {
      expect(() => {
        controller.refresh('');
      }).toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh('invalid.refresh.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Refresh token expired'),
      );

      await expect(controller.refresh('expired.refresh.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      const userDto = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      };

      mockAuthService.getCurrentUser.mockResolvedValue(userDto);

      const result = await controller.getCurrentUser({ sub: mockUser.id });

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(userDto);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockAuthService.getCurrentUser.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.getCurrentUser({ sub: 'invalid-id' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not include password in response', async () => {
      const userDto = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      };

      mockAuthService.getCurrentUser.mockResolvedValue(userDto);

      const result = await controller.getCurrentUser({ sub: mockUser.id });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Endpoint integration scenarios', () => {
    it('should handle complete flow: register -> login -> getCurrentUser', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      // Register
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const registerResult = await controller.register(registerDto);
      expect(registerResult).toHaveProperty('accessToken');

      // Login
      jest.clearAllMocks();
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const loginResult = await controller.login({
        email: registerDto.email,
        password: registerDto.password,
      });
      expect(loginResult).toHaveProperty('refreshToken');

      // Get current user
      jest.clearAllMocks();
      mockAuthService.getCurrentUser.mockResolvedValue(mockAuthResponse.user);
      const userResult = await controller.getCurrentUser({ sub: mockUser.id });
      expect(userResult.email).toBe(registerDto.email);
    });

    it('should handle token refresh workflow', async () => {
      mockAuthService.refreshToken.mockResolvedValue('new.access.token');

      const result = await controller.refresh('mock.refresh.token');

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).toBe('new.access.token');
    });
  });
});
