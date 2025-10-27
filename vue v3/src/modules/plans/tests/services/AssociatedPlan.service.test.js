// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/plans/services/tests/AssociatedPlan.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AxiosService from '@/services/Axios.service';
import * as AssociatedPlanService from '../../services/AssociatedPlan.service';

// Mock the AxiosService
vi.mock('@/services/Axios.service', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

describe('AssociatedPlan Service', () => {
    const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAssociatedPlan', () => {
        it('should call AxiosService.get with correct parameters', async () => {
            // Arrange
            const id = 123;
            const associatedPlanId = 456;
            const params = { include: 'benefits' };
            const mockResponse = { data: { id: 456 } };
            AxiosService.get.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.getAssociatedPlan(
                id,
                associatedPlanId,
                params
            );

            // Assert
            expect(AxiosService.get).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getAssociatedPlans', () => {
        it('should call AxiosService.get with correct parameters', async () => {
            // Arrange
            const id = 123;
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            AxiosService.get.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.getAssociatedPlans(
                id,
                params
            );

            // Assert
            expect(AxiosService.get).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans`,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('createAssociatedPlan', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { name: 'Test Plan' };
            const mockResponse = { data: { id: 456, name: 'Test Plan' } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.createAssociatedPlan(
                id,
                payload
            );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateAssociatedPlan', () => {
        it('should call AxiosService.put with correct parameters', async () => {
            // Arrange
            const id = 123;
            const associatedPlanId = 456;
            const payload = { name: 'Updated Plan' };
            const mockResponse = { data: { id: 456, name: 'Updated Plan' } };
            AxiosService.put.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.updateAssociatedPlan(
                id,
                associatedPlanId,
                payload
            );

            // Assert
            expect(AxiosService.put).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateAssociatedPlanDependantsSettings', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const associatedPlanId = 456;
            const payload = { settings: { enabled: true } };
            const mockResponse = {
                data: { id: 456, settings: { enabled: true } }
            };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result =
                await AssociatedPlanService.updateAssociatedPlanDependantsSettings(
                    associatedPlanId,
                    payload
                );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${associatedPlanId}/dependants-settings`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateAssociatedPlanStatus', () => {
        it('should call AxiosService.patch with correct parameters', async () => {
            // Arrange
            const id = 456;
            const payload = { status: 'active' };
            const mockResponse = { data: { id: 456, status: 'active' } };
            AxiosService.patch.mockResolvedValue(mockResponse);

            // Act
            const result =
                await AssociatedPlanService.updateAssociatedPlanStatus(
                    id,
                    payload
                );

            // Assert
            expect(AxiosService.patch).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/change-status`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteAssociatedPlan', () => {
        it('should call AxiosService.delete with correct parameters', async () => {
            // Arrange
            const id = 123;
            const associatedPlanId = 456;
            const mockResponse = { data: { success: true } };
            AxiosService.delete.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.deleteAssociatedPlan(
                id,
                associatedPlanId
            );

            // Assert
            expect(AxiosService.delete).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('copyBenefitsFromParent', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 123;
            const associatedPlanId = 456;
            const mockResponse = { data: { success: true } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.copyBenefitsFromParent(
                id,
                associatedPlanId
            );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}/benefits/copy`
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('searchBenefits', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 456;
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.searchBenefits(
                id,
                payload,
                params
            );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/benefits/excluded/search`,
                payload,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('searchBenefitGroups', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 456;
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.searchBenefitGroups(
                id,
                payload,
                params
            );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/benefit-groups/excluded/search`,
                payload,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    // Testing a few more key functions

    describe('attachBenefitGroups', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 456;
            const resources = [1, 2, 3];
            const mockResponse = { data: { success: true } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.attachBenefitGroups(
                id,
                resources
            );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/benefit-groups/attach`,
                { resources }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('planPricesUpdate', () => {
        it('should call AxiosService.put with correct parameters', async () => {
            // Arrange
            const id = 456;
            const priceId = 789;
            const payload = { amount: 100 };
            const mockResponse = { data: { id: 789, amount: 100 } };
            AxiosService.put.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.planPricesUpdate(
                id,
                priceId,
                payload
            );

            // Assert
            expect(AxiosService.put).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/prices/${priceId}`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('syncPrices', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 456;
            const mockResponse = { data: { success: true } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result = await AssociatedPlanService.syncPrices(id);

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/associated-plans/${id}/prices/calculate`
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
