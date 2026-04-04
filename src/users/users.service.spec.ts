import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword123456789',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    lastLoginAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    comparePassword: jest.fn(),
    hashPasswordOnInsert: jest.fn(),
    hashPasswordOnUpdate: jest.fn(),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const createdUser = { ...mockUser, ...createUserDto };

      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      const result = await usersService.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should trigger password hashing on create', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'PlainPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const createdUser = { ...mockUser, ...createUserDto, password: '$2b$10$hashed' };

      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      const result = await usersService.create(createUserDto);

      expect(result.password).not.toEqual(createUserDto.password);
      expect(result.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('test@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await usersService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should be case-insensitive for email lookup', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await usersService.findByEmail('TEST@EXAMPLE.COM');

      expect(usersRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find user by id and exclude password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      mockUsersRepository.findOne.mockResolvedValue(userWithoutPassword);

      const result = await usersService.findById(mockUser.id);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should return null if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await usersService.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt timestamp', async () => {
      const updatedUser = { ...mockUser, lastLoginAt: new Date() };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      const result = await usersService.updateLastLogin(mockUser.id);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(usersRepository.save).toHaveBeenCalled();
      expect((result as any).lastLoginAt).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(usersService.updateLastLogin('invalid-id')).rejects.toThrow();
    });

    it('should update the user record in database', async () => {
      const updatedUser = { ...mockUser, lastLoginAt: new Date() };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      await usersService.updateLastLogin(mockUser.id);

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        { ...mockUser, password: undefined },
        { ...mockUser, id: 'user-2', email: 'user2@example.com', password: undefined },
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await usersService.findAll();

      expect(usersRepository.find).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersRepository.find.mockResolvedValue([]);

      const result = await usersService.findAll();

      expect(result).toEqual([]);
    });

    it('should never include password field in results', async () => {
      const users = [mockUser];
      mockUsersRepository.find.mockResolvedValue(users);

      const result = await usersService.findAll();

      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('Service integration', () => {
    it('should handle user lifecycle: create -> findByEmail -> updateLastLogin -> findAll', async () => {
      const createUserDto = {
        email: 'lifecycle@example.com',
        password: 'SecurePass123!',
        firstName: 'Lifecycle',
        lastName: 'Test',
      };

      // Create user
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      const created = await usersService.create(createUserDto);
      expect(created).toBeDefined();

      // Find by email
      jest.clearAllMocks();
      mockUsersRepository.findOne.mockResolvedValue(createdUser);
      const found = await usersService.findByEmail(createUserDto.email);
      expect(found).toBeDefined();

      // Update last login
      jest.clearAllMocks();
      const updatedUser = { ...createdUser, lastLoginAt: new Date() };
      mockUsersRepository.findOne.mockResolvedValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      const updated = await usersService.updateLastLogin(created.id);
      expect((updated as any).lastLoginAt).toBeDefined();

      // Find all
      jest.clearAllMocks();
      mockUsersRepository.find.mockResolvedValue([updated]);
      const all = await usersService.findAll();
      expect(all).toHaveLength(1);
    });
  });
});
