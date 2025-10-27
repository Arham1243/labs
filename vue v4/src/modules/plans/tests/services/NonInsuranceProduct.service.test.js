// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/plans/services/tests/NonInsuranceProduct.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AxiosService from '@/services/Axios.service';
import * as NonInsuranceProductService from '../../services/NonInsuranceProduct.service';
import { nonInsuranceProductPricesUpdate } from '../../services/NonInsuranceProduct.service';

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

describe('Non-Insurance Product Service', () => {
    const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchNonInsuranceProduct', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.searchNonInsuranceProduct(
                    payload,
                    params
                );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/search`,
                payload,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getNonInsuranceProduct', () => {
        it('should call AxiosService.get with correct parameters', async () => {
            // Arrange
            const id = 123;
            const params = { include: 'prices' };
            const mockResponse = { data: { id: 123 } };
            AxiosService.get.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.getNonInsuranceProduct(
                    id,
                    params
                );

            // Assert
            expect(AxiosService.get).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}`,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('createNonInsuranceProduct', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const payload = { name: 'Test Non-Insurance Product' };
            const mockResponse = {
                data: { id: 123, name: 'Test Non-Insurance Product' }
            };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.createNonInsuranceProduct(
                    payload
                );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateNonInsuranceProduct', () => {
        it('should call AxiosService.put with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { name: 'Updated Non-Insurance Product' };
            const mockResponse = {
                data: { id: 123, name: 'Updated Non-Insurance Product' }
            };
            AxiosService.put.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.updateNonInsuranceProduct(
                    id,
                    payload
                );

            // Assert
            expect(AxiosService.put).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateNonInsuranceProductStatus', () => {
        it('should call AxiosService.patch with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { status: 'active' };
            const mockResponse = { data: { id: 123, status: 'active' } };
            AxiosService.patch.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.updateNonInsuranceProductStatus(
                    id,
                    payload
                );

            // Assert
            expect(AxiosService.patch).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/change-status`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteNonInsuranceProduct', () => {
        it('should call AxiosService.delete with correct parameters', async () => {
            // Arrange
            const id = 123;
            const mockResponse = { data: { success: true } };
            AxiosService.delete.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.deleteNonInsuranceProduct(id);

            // Assert
            expect(AxiosService.delete).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}`
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('changeNonInsuranceProductStatus', () => {
        it('should call AxiosService.patch with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { status: 'active' };
            const mockResponse = { data: { id: 123, status: 'active' } };
            AxiosService.patch.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.changeNonInsuranceProductStatus(
                    id,
                    payload
                );

            // Assert
            expect(AxiosService.patch).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/change-status`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('detachNonInsuranceProductWithPrices', () => {
        it('should call AxiosService.delete with correct parameters', async () => {
            // Arrange
            const id = 123;
            const resources = { ids: [1, 2, 3] };
            const mockResponse = { data: { success: true } };
            AxiosService.delete.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.detachNonInsuranceProductWithPrices(
                    id,
                    resources
                );

            // Assert
            expect(AxiosService.delete).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/prices/batch`,
                { data: resources }
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('nonInsuranceProductPricesDelete', () => {
        it('should call AxiosService.delete with correct parameters', async () => {
            // Arrange
            const id = 123;
            const priceId = 456;
            const mockResponse = { data: { success: true } };
            AxiosService.delete.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.nonInsuranceProductPricesDelete(
                    id,
                    priceId
                );

            // Assert
            expect(AxiosService.delete).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/prices/${priceId}`
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('nonInsuranceProductPricesUpdate', () => {
        it('should call AxiosService.put with correct parameters', async () => {
            // Arrange
            const id = 123;
            const priceId = 456;
            const payload = { amount: 100 };
            const mockResponse = { data: { id: 456, amount: 100 } };
            AxiosService.put.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.nonInsuranceProductPricesUpdate(
                    id,
                    priceId,
                    payload
                );

            // Assert
            expect(AxiosService.put).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/prices/${priceId}`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('nonInsuranceProductPricesStore', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { amount: 100 };
            const mockResponse = { data: { id: 456, amount: 100 } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.nonInsuranceProductPricesStore(
                    id,
                    payload
                );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/prices`,
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('searchNonInsuranceProductPrices', () => {
        it('should call AxiosService.post with correct parameters', async () => {
            // Arrange
            const id = 123;
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            AxiosService.post.mockResolvedValue(mockResponse);

            // Act
            const result =
                await NonInsuranceProductService.searchNonInsuranceProductPrices(
                    id,
                    payload,
                    params
                );

            // Assert
            expect(AxiosService.post).toHaveBeenCalledWith(
                `${BASE_URL}/non-insurance-products/${id}/prices/search`,
                payload,
                { params }
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
