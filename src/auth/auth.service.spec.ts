import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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

  const mockAccessToken = 'mock.access.token';
  const mockRefreshToken = 'mock.refresh.token';
  const mockTokenPayload = {
    sub: mockUser.id,
    email: mockUser.email,
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    findAll: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should successfully register a new user', async () => {
      const createdUser = { ...mockUser, ...registerDto };
      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const result = await authService.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully login a user with correct credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUsersService.updateLastLogin.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const result = await authService.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return null if password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const result = await authService.generateTokens(mockTokenPayload);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockAccessToken,
      });
    });

    it('should sign with correct payload structure', async () => {
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      await authService.generateTokens(mockTokenPayload);

      const accessTokenCall = (jwtService.signAsync as jest.Mock).mock.calls[0];
      expect(accessTokenCall[0]).toEqual(mockTokenPayload);
    });

    it('should use different expirations for access and refresh tokens', async () => {
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      await authService.generateTokens(mockTokenPayload);

      const calls = (jwtService.signAsync as jest.Mock).mock.calls;
      const accessTokenOptions = calls[0][1];
      const refreshTokenOptions = calls[1][1];

      expect(accessTokenOptions).toBeDefined();
      expect(refreshTokenOptions).toBeDefined();
      expect(accessTokenOptions.expiresIn).toBeDefined();
      expect(refreshTokenOptions.expiresIn).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      mockJwtService.verify.mockReturnValue(mockTokenPayload);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const result = await authService.refreshToken(mockRefreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.any(Object),
      );
      expect(usersService.findById).toHaveBeenCalledWith(mockTokenPayload.sub);
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toBe(mockAccessToken);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verify.mockReturnValue(mockTokenPayload);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when user is found', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser(mockUser.id);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(authService.getCurrentUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete authentication flow: register -> login -> refresh', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Register
      const registeredUser = { ...mockUser, ...registerDto };
      mockUsersService.create.mockResolvedValue(registeredUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const registerResult = await authService.register(registerDto);
      expect(registerResult).toHaveProperty('accessToken');

      // Login
      jest.clearAllMocks();
      const validatedUser = {
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
      };
      mockUsersService.findByEmail.mockResolvedValue(registeredUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);
      mockUsersService.updateLastLogin.mockResolvedValue(registeredUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const loginResult = await authService.login({
        email: registerDto.email,
        password: registerDto.password,
      });
      expect(loginResult).toHaveProperty('refreshToken');

      // Refresh token
      jest.clearAllMocks();
      mockJwtService.verify.mockReturnValue(mockTokenPayload);
      mockUsersService.findById.mockResolvedValue(registeredUser);
      mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

      const refreshResult = await authService.refreshToken(mockRefreshToken);
      expect(refreshResult).toBeDefined();
    });
  });
});
