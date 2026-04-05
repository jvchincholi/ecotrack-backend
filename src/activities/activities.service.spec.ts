import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

/**
 * Unit tests for ActivitiesService
 * 
 * Tests cover:
 * - Activity creation with CO2 calculation
 * - Listing activities with pagination
 * - Single activity retrieval
 * - Activity updates
 * - Activity deletion
 * - Total emissions calculation
 * - Error handling
 */
describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let repository: any;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockActivityId = '550e8401-e29b-41d4-a716-446655440001';

  const mockActivity: Activity = {
    id: mockActivityId,
    userId: mockUserId,
    type: 'transport',
    value: 15.5,
    unit: 'km',
    co2Emitted: 3.57,
    date: new Date('2026-04-05T10:30:00Z'),
    createdAt: new Date('2026-04-05T14:22:15Z'),
    user: null,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    repository = module.get(getRepositoryToken(Activity));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create an activity', async () => {
      const createDto: CreateActivityDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const result = await service.create(mockUserId, createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          type: createDto.type,
          value: createDto.value,
          unit: createDto.unit,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', mockActivityId);
      expect(result).toHaveProperty('co2Emitted');
    });

    it('should calculate CO2 emissions based on activity type', async () => {
      const createDto: CreateActivityDto = {
        type: ActivityType.TRANSPORT,
        value: 10,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      await service.create(mockUserId, createDto);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.co2Emitted).toBeDefined();
      expect(typeof createCall.co2Emitted).toBe('number');
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const createDto: CreateActivityDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(mockUserId, createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      const activities = [mockActivity];
      mockRepository.findAndCount.mockResolvedValue([activities, 1]);

      const result = await service.findAll(mockUserId, 1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          take: 10,
          skip: 0,
        }),
      );
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
    });

    it('should validate page parameter', async () => {
      await expect(service.findAll(mockUserId, 0, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate limit parameter', async () => {
      await expect(service.findAll(mockUserId, 1, 101)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate correct skip offset', async () => {
      const activities = [mockActivity];
      mockRepository.findAndCount.mockResolvedValue([activities, 10]);

      await service.findAll(mockUserId, 3, 5);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (3 - 1) * 5 = 10
        }),
      );
    });

    it('should handle empty results', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(mockUserId, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return activity when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockActivity);

      const result = await service.findOne(mockUserId, mockActivityId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockActivityId, userId: mockUserId },
      });
      expect(result).toHaveProperty('id', mockActivityId);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user owns different activity', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('different-user-id', mockActivityId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update activity fields', async () => {
      const updateDto: UpdateActivityDto = {
        value: 20.5,
      };

      const updatedActivity = { ...mockActivity, value: 20.5 };
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(updatedActivity);

      const result = await service.update(mockUserId, mockActivityId, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockActivityId, userId: mockUserId },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.value).toBe(20.5);
    });

    it('should recalculate emissions on value change', async () => {
      const updateDto: UpdateActivityDto = {
        value: 20,
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      await service.update(mockUserId, mockActivityId, updateDto);

      const saveCall = mockRepository.save.mock.calls[0][0];
      expect(saveCall.co2Emitted).toBeDefined();
    });

    it('should throw NotFoundException when activity not found', async () => {
      const updateDto: UpdateActivityDto = { value: 20 };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUserId, mockActivityId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateActivityDto = {
        value: 25,
        unit: 'miles',
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue({
        ...mockActivity,
        ...updateDto,
      });

      const result = await service.update(mockUserId, mockActivityId, updateDto);

      expect(result.value).toBe(25);
      expect(result.unit).toBe('miles');
    });
  });

  describe('remove', () => {
    it('should delete activity', async () => {
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockActivityId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockActivityId, userId: mockUserId },
      });
      expect(repository.delete).toHaveBeenCalledWith(mockActivityId);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUserId, mockActivityId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on delete error', async () => {
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.delete.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(mockUserId, mockActivityId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getTotalEmissions', () => {
    it('should calculate total emissions without date filter', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '42.5' }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalEmissions(mockUserId);

      expect(result).toBe(42.5);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should filter emissions by date range', async () => {
      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '25.0' }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalEmissions(mockUserId, startDate, endDate);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(result).toBe(25.0);
    });

    it('should return 0 when no activities found', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTotalEmissions(mockUserId);

      expect(result).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete activity lifecycle', async () => {
      const createDto: CreateActivityDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      // Create
      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const created = await service.create(mockUserId, createDto);
      expect(created).toBeDefined();

      // Retrieve
      jest.clearAllMocks();
      mockRepository.findOne.mockResolvedValue(mockActivity);

      const retrieved = await service.findOne(mockUserId, mockActivityId);
      expect(retrieved.id).toBe(mockActivityId);

      // Update
      jest.clearAllMocks();
      const updateDto: UpdateActivityDto = { value: 20 };
      const updatedActivity = { ...mockActivity, value: 20 };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(updatedActivity);

      const updated = await service.update(mockUserId, mockActivityId, updateDto);
      expect(updated.value).toBe(20);

      // Delete
      jest.clearAllMocks();
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockActivityId);
      expect(repository.delete).toHaveBeenCalled();
    });
  });
});
