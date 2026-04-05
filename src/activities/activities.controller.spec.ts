import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityType } from './dto/create-activity.dto';

/**
 * Unit tests for ActivitiesController
 * 
 * Tests cover:
 * - Creating activities via HTTP
 * - Listing activities with pagination
 * - Retrieving single activity
 * - Updating activity
 * - Deleting activity
 * - Error handling and validation
 * - Authorization checks
 */
describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let service: ActivitiesService;

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockActivityId = '550e8401-e29b-41d4-a716-446655440001';

  const mockActivityResponse = {
    id: mockActivityId,
    userId: mockUserId,
    type: 'transport',
    value: 15.5,
    unit: 'km',
    co2Emitted: 3.57,
    date: new Date('2026-04-05T10:30:00Z'),
    createdAt: new Date('2026-04-05T14:22:15Z'),
  };

  const mockPaginatedResponse = {
    data: [mockActivityResponse],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockAuthUser = { sub: mockUserId };

  const mockActivitiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTotalEmissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    service = module.get<ActivitiesService>(ActivitiesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const createDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockActivitiesService.create.mockResolvedValue(mockActivityResponse);

      const result = await controller.create(mockAuthUser, createDto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, createDto);
      expect(result).toEqual(mockActivityResponse);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('co2Emitted');
    });

    it('should throw BadRequestException for invalid data', async () => {
      const createDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockActivitiesService.create.mockRejectedValue(
        new BadRequestException('Invalid activity type'),
      );

      await expect(controller.create(mockAuthUser, createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call service with authenticated user ID', async () => {
      const createDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      mockActivitiesService.create.mockResolvedValue(mockActivityResponse);

      await controller.create(mockAuthUser, createDto);

      expect(service.create).toHaveBeenCalledWith(mockUserId, expect.any(Object));
    });
  });

  describe('findAll', () => {
    it('should return paginated activities', async () => {
      mockActivitiesService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(mockAuthUser, 1, 10);

      expect(service.findAll).toHaveBeenCalledWith(mockUserId, 1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
    });

    it('should use default pagination values', async () => {
      mockActivitiesService.findAll.mockResolvedValue(mockPaginatedResponse);

      await controller.findAll(mockAuthUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUserId, 1, 10);
    });

    it('should handle custom pagination', async () => {
      mockActivitiesService.findAll.mockResolvedValue({
        ...mockPaginatedResponse,
        page: 2,
        limit: 20,
      });

      const result = await controller.findAll(mockAuthUser, 2, 20);

      expect(service.findAll).toHaveBeenCalledWith(mockUserId, 2, 20);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should throw BadRequestException for invalid pagination', async () => {
      mockActivitiesService.findAll.mockRejectedValue(
        new BadRequestException('Invalid pagination'),
      );

      await expect(controller.findAll(mockAuthUser, 0, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle empty results', async () => {
      mockActivitiesService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const result = await controller.findAll(mockAuthUser, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return activity by ID', async () => {
      mockActivitiesService.findOne.mockResolvedValue(mockActivityResponse);

      const result = await controller.findOne(mockAuthUser, mockActivityId);

      expect(service.findOne).toHaveBeenCalledWith(mockUserId, mockActivityId);
      expect(result).toEqual(mockActivityResponse);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockActivitiesService.findOne.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      await expect(controller.findOne(mockAuthUser, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce ownership check', async () => {
      mockActivitiesService.findOne.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      const differentUser = { sub: 'different-user-id' };
      await expect(controller.findOne(differentUser, mockActivityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update activity', async () => {
      const updateDto = { value: 20.5 };
      const updatedActivity = { ...mockActivityResponse, value: 20.5 };

      mockActivitiesService.update.mockResolvedValue(updatedActivity);

      const result = await controller.update(mockAuthUser, mockActivityId, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUserId, mockActivityId, updateDto);
      expect(result.value).toBe(20.5);
    });

    it('should support partial updates', async () => {
      const updateDto = { description: 'Updated description' };
      const updatedActivity = { ...mockActivityResponse, ...updateDto };

      mockActivitiesService.update.mockResolvedValue(updatedActivity);

      const result = await controller.update(mockAuthUser, mockActivityId, updateDto);

      expect(result).toHaveProperty('description', 'Updated description');
    });

    it('should throw NotFoundException when activity not found', async () => {
      const updateDto = { value: 20 };

      mockActivitiesService.update.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      await expect(controller.update(mockAuthUser, 'invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid data', async () => {
      const updateDto = { value: -5 };

      mockActivitiesService.update.mockRejectedValue(
        new BadRequestException('Invalid value'),
      );

      await expect(
        controller.update(mockAuthUser, mockActivityId, updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should recalculate emissions on update', async () => {
      const updateDto = { value: 25 };
      const updatedActivity = {
        ...mockActivityResponse,
        value: 25,
        co2Emitted: 5.75,
      };

      mockActivitiesService.update.mockResolvedValue(updatedActivity);

      const result = await controller.update(mockAuthUser, mockActivityId, updateDto);

      expect(result.co2Emitted).toBe(5.75);
    });
  });

  describe('remove', () => {
    it('should delete activity', async () => {
      mockActivitiesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockAuthUser, mockActivityId);

      expect(service.remove).toHaveBeenCalledWith(mockUserId, mockActivityId);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockActivitiesService.remove.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      await expect(controller.remove(mockAuthUser, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce ownership check on delete', async () => {
      mockActivitiesService.remove.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      const differentUser = { sub: 'different-user-id' };
      await expect(controller.remove(differentUser, mockActivityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete activity workflow', async () => {
      const createDto = {
        type: ActivityType.TRANSPORT,
        value: 15.5,
        unit: 'km',
        date: '2026-04-05T10:30:00Z',
      };

      // Create
      mockActivitiesService.create.mockResolvedValue(mockActivityResponse);
      const created = await controller.create(mockAuthUser, createDto);
      expect(created).toBeDefined();

      // List
      jest.clearAllMocks();
      mockActivitiesService.findAll.mockResolvedValue(mockPaginatedResponse);
      const list = await controller.findAll(mockAuthUser, 1, 10);
      expect(list.data).toContainEqual(expect.objectContaining({ id: mockActivityId }));

      // Get
      jest.clearAllMocks();
      mockActivitiesService.findOne.mockResolvedValue(mockActivityResponse);
      const single = await controller.findOne(mockAuthUser, mockActivityId);
      expect(single.id).toBe(mockActivityId);

      // Update
      jest.clearAllMocks();
      const updateDto = { value: 20 };
      mockActivitiesService.update.mockResolvedValue({
        ...mockActivityResponse,
        value: 20,
      });
      const updated = await controller.update(mockAuthUser, mockActivityId, updateDto);
      expect(updated.value).toBe(20);

      // Delete
      jest.clearAllMocks();
      mockActivitiesService.remove.mockResolvedValue(undefined);
      await controller.remove(mockAuthUser, mockActivityId);
      expect(service.remove).toHaveBeenCalled();
    });

    it('should maintain authorization across operations', async () => {
      const differentUser = { sub: 'different-user-id' };

      mockActivitiesService.findOne.mockRejectedValue(
        new NotFoundException('Activity not found'),
      );

      // User should not access another user's activity
      await expect(controller.findOne(differentUser, mockActivityId)).rejects.toThrow(
        NotFoundException,
      );

      // Service should be called with the user's ID, not another's
      const lastCall = mockActivitiesService.findOne.mock.calls[0];
      expect(lastCall[0]).toBe(differentUser.sub);
    });
  });
});
