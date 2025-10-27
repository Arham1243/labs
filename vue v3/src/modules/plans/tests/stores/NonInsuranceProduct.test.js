// filepath: /Users/yassirawad/Projects/horus/horus-platform-app/src/modules/plans/stores/tests/NonInsuranceProduct.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNonInsuranceProductStore } from '../../stores/NonInsuranceProduct';
import * as NonInsuranceProductService from '../../services/NonInsuranceProduct.service';
import { useGlobalStore } from '@/stores';

// Mock the NonInsuranceProductService
vi.mock('../../services/NonInsuranceProduct.service', () => ({
    searchNonInsuranceProduct: vi.fn(),
    getNonInsuranceProduct: vi.fn(),
    createNonInsuranceProduct: vi.fn(),
    updateNonInsuranceProduct: vi.fn(),
    updateNonInsuranceProductStatus: vi.fn(),
    deleteNonInsuranceProduct: vi.fn(),
    changeNonInsuranceProductStatus: vi.fn(),
    detachNonInsuranceProductWithPrices: vi.fn(),
    nonInsuranceProductPricesDelete: vi.fn(),
    nonInsuranceProductPricesUpdate: vi.fn(),
    nonInsuranceProductPricesStore: vi.fn(),
    searchNonInsuranceProductPrices: vi.fn()
}));

// Mock the GlobalStore
vi.mock('@/stores', () => {
    const showSuccessMock = vi.fn();
    return {
        useGlobalStore: vi.fn(() => ({
            actionWrapper: vi.fn(async (fn) => {
                const result = await fn();
                return result;
            }),
            showSuccess: showSuccessMock
        }))
    };
});

// Mock the vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: vi.fn((key) => key),
        locale: 'en'
    }))
}));

describe('Non-Insurance Product Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('state', () => {
        it('should have default state', () => {
            // Arrange & Act
            const store = useNonInsuranceProductStore();

            // Assert
            expect(store.currentNonInsuranceProduct).toBeUndefined();
        });
    });

    describe('setCurrentMNonInsuranceProduct', () => {
        it('should set currentNonInsuranceProduct', () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const nonInsuranceProduct = {
                id: 123,
                name: 'Test Non-Insurance Product'
            };

            // Act
            store.setCurrentNonInsuranceProduct(nonInsuranceProduct);

            // Assert
            expect(store.currentNonInsuranceProduct).toEqual(
                nonInsuranceProduct
            );
        });
    });

    describe('clearCurrentNonInsuranceProduct', () => {
        it('should clear currentNonInsuranceProduct', () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            store.setCurrentNonInsuranceProduct({
                id: 123,
                name: 'Test Non-Insurance Product'
            });

            // Act
            store.clearCurrentNonInsuranceProduct();

            // Assert
            expect(store.currentNonInsuranceProduct).toBeNull();
        });
    });

    describe('searchNonInsuranceProduct', () => {
        it('should call NonInsuranceProductService.searchMNonInsuranceProduct and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            NonInsuranceProductService.searchNonInsuranceProduct.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.searchNonInsuranceProduct(
                payload,
                params
            );

            // Assert
            expect(
                NonInsuranceProductService.searchNonInsuranceProduct
            ).toHaveBeenCalledWith(payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('getNonInsuranceProduct', () => {
        it('should call NonInsuranceProductService.getNonInsuranceProduct with correct parameters and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const id = 123;
            const params = { include: 'prices' };
            const mockResponse = { data: { id: 123 } };
            NonInsuranceProductService.getNonInsuranceProduct.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.getNonInsuranceProduct(id, params);

            // Assert
            expect(
                NonInsuranceProductService.getNonInsuranceProduct
            ).toHaveBeenCalledWith(id, {
                ...params,
                include: 'authorized'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('createNonInsuranceProduct', () => {
        it('should call MNonInsuranceProductService.createNonInsuranceProduct, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const payload = { name: 'New Non-Insurance Product' };
            const mockResponse = {
                data: { id: 123, name: 'New Non-Insurance Product' }
            };
            NonInsuranceProductService.createNonInsuranceProduct.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.createNonInsuranceProduct(payload);

            // Assert
            expect(
                NonInsuranceProductService.createNonInsuranceProduct
            ).toHaveBeenCalledWith(payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_created',
                'notifications.non_insurance_product_created_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateNonInsuranceProduct', () => {
        it('should call NonInsuranceProductService.updateNonInsuranceProduct, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const payload = { name: 'Updated Non-Insurance Product' };
            const mockResponse = {
                data: { id: 123, name: 'Updated Non-Insurance Product' }
            };
            NonInsuranceProductService.updateNonInsuranceProduct.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.updateNonInsuranceProduct(id, payload);

            // Assert
            expect(
                NonInsuranceProductService.updateNonInsuranceProduct
            ).toHaveBeenCalledWith(id, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_updated',
                'notifications.non_insurance_product_updated_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateNonInsuranceProductStatus', () => {
        it('should call NonInsuranceProductService.updateNonInsuranceProductStatus, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const payload = { status: 'active' };
            const mockResponse = { data: { id: 123, status: 'active' } };
            NonInsuranceProductService.updateNonInsuranceProductStatus.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.updateNonInsuranceProductStatus(
                id,
                payload
            );

            // Assert
            expect(
                NonInsuranceProductService.updateNonInsuranceProductStatus
            ).toHaveBeenCalledWith(id, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_updated',
                'notifications.non_insurance_product_updated_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteNonInsuranceProduct', () => {
        it('should call NonInsuranceProductService.deleteNonInsuranceProduct, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const mockResponse = { data: { success: true } };
            NonInsuranceProductService.deleteNonInsuranceProduct.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.deleteNonInsuranceProduct(id);

            // Assert
            expect(
                NonInsuranceProductService.deleteNonInsuranceProduct
            ).toHaveBeenCalledWith(id);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_deleted',
                'notifications.non_insurance_product_deleted_details'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('publishNonInsuranceProduct', () => {
        it('should call NonInsuranceProductService.changeNonInsuranceProductStatus with active status, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const mockResponse = { data: { id: 123, status: 'active' } };
            NonInsuranceProductService.changeNonInsuranceProductStatus.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.publishNonInsuranceProduct(id);

            // Assert
            expect(
                NonInsuranceProductService.changeNonInsuranceProductStatus
            ).toHaveBeenCalledWith(id, { status: 'active' });
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_published',
                'notifications.non_insurance_product_published_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('detachNonInsuranceProductWithPrices', () => {
        it('should call NonInsuranceProductService.detachNonInsuranceProductWithPrices, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const resources = { ids: [1, 2, 3] };
            const mockResponse = { data: { success: true } };
            NonInsuranceProductService.detachNonInsuranceProductWithPrices.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.detachNonInsuranceProductWithPrices(
                id,
                resources
            );

            // Assert
            expect(
                NonInsuranceProductService.detachNonInsuranceProductWithPrices
            ).toHaveBeenCalledWith(id, resources);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_price_deleted',
                'notifications.non_insurance_product_price_deleted_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('nonInsuranceProductPricesDelete', () => {
        it('should call NonInsuranceProductService.nonInsuranceProductPricesDelete, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const priceId = 456;
            const mockResponse = { data: { success: true } };
            NonInsuranceProductService.nonInsuranceProductPricesDelete.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.nonInsuranceProductPricesDelete(
                id,
                priceId
            );

            // Assert
            expect(
                NonInsuranceProductService.nonInsuranceProductPricesDelete
            ).toHaveBeenCalledWith(id, priceId);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_price_deleted',
                'notifications.non_insurance_product_price_deleted_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('nonInsuranceProductPricesUpdate', () => {
        it('should call NonInsuranceProductService.nonInsuranceProductPricesUpdate, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const priceId = 456;
            const payload = { amount: 100 };
            const mockResponse = { data: { id: 456, amount: 100 } };
            NonInsuranceProductService.nonInsuranceProductPricesUpdate.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.nonInsuranceProductPricesUpdate(
                id,
                priceId,
                payload
            );

            // Assert
            expect(
                NonInsuranceProductService.nonInsuranceProductPricesUpdate
            ).toHaveBeenCalledWith(id, priceId, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_price_updated',
                'notifications.non_insurance_product_price_updated_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('nonInsuranceProductPricesStore', () => {
        it('should call NonInsuranceProductService.nonInsuranceProductPricesStore, show success message, and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const globalStore = useGlobalStore();
            const id = 123;
            const payload = { amount: 100 };
            const mockResponse = { data: { id: 456, amount: 100 } };
            NonInsuranceProductService.nonInsuranceProductPricesStore.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.nonInsuranceProductPricesStore(
                id,
                payload
            );

            // Assert
            expect(
                NonInsuranceProductService.nonInsuranceProductPricesStore
            ).toHaveBeenCalledWith(id, payload);
            expect(globalStore.showSuccess).toHaveBeenCalledWith(
                'notifications.non_insurance_product_price_created',
                'notifications.non_insurance_product_price_created_detail'
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('searchNonInsuranceProductPrices', () => {
        it('should call NonInsuranceProductService.searchNonInsuranceProductPrices and return data', async () => {
            // Arrange
            const store = useNonInsuranceProductStore();
            const id = 123;
            const payload = { search: 'test' };
            const params = { page: 1 };
            const mockResponse = { data: { items: [] } };
            NonInsuranceProductService.searchNonInsuranceProductPrices.mockResolvedValue(
                mockResponse
            );

            // Act
            const result = await store.searchNonInsuranceProductPrices(
                id,
                payload,
                params
            );

            // Assert
            expect(
                NonInsuranceProductService.searchNonInsuranceProductPrices
            ).toHaveBeenCalledWith(id, payload, params);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
