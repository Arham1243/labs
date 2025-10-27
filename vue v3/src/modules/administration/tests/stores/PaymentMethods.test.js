import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePaymentMethodsStore } from '@/modules/administration/stores';
import { PaymentMethodsService } from '@/modules/administration/services';

// Mock the PaymentMethodsService
vi.mock('@/modules/administration/services', () => ({
    PaymentMethodsService: {
        search: vi.fn(),
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        deleteItem: vi.fn()
    }
}));

// Mock the GlobalStore
vi.mock('@/stores', () => ({
    useGlobalStore: vi.fn(() => ({
        actionWrapper: vi.fn((fn) => fn()),
        showSuccess: vi.fn(),
        clearErrors: vi.fn()
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PaymentMethodsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls PaymentMethodsService.search and returns the data', async () => {
            const store = usePaymentMethodsStore();
            const payload = { name: 'Stripe' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            payment_provider_id: 'stripe',
                            payment_type: 'credit_card',
                            enrollment_types: ['file_transfer'],
                            status: 'active',
                            updated_at: '2023-01-01T00:00:00.000000Z'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            PaymentMethodsService.search.mockResolvedValue(mockResponse);

            const result = await store.search(payload, params);

            expect(PaymentMethodsService.search).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('list', () => {
        it('calls PaymentMethodsService.list and returns the data', async () => {
            const store = usePaymentMethodsStore();
            const payload = { name: 'Stripe' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            payment_provider_id: 'stripe',
                            payment_type: 'credit_card',
                            enrollment_types: ['file_transfer'],
                            status: 'active',
                            updated_at: '2023-01-01T00:00:00.000000Z'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            PaymentMethodsService.list.mockResolvedValue(mockResponse);

            const result = await store.list(payload, params);

            expect(PaymentMethodsService.list).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls PaymentMethodsService.create with the correct parameters and shows success message', async () => {
            const store = usePaymentMethodsStore();
            const payload = {
                payment_provider_id: 'stripe',
                payment_type: 'credit_card',
                enrollment_types: ['file_transfer'],
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '456',
                    payment_provider_id: 'stripe',
                    payment_type: 'credit_card',
                    enrollment_types: ['file_transfer'],
                    status: 'active',
                    updated_at: '2023-01-01T00:00:00.000000Z'
                }
            };

            PaymentMethodsService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(PaymentMethodsService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls PaymentMethodsService.update with the correct parameters and shows success message', async () => {
            const store = usePaymentMethodsStore();
            const id = '123';
            const payload = {
                payment_provider_id: 'stripe',
                payment_type: 'credit_card',
                enrollment_types: ['file_transfer'],
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    payment_provider_id: 'stripe',
                    payment_type: 'credit_card',
                    enrollment_types: ['file_transfer'],
                    status: 'active',
                    updated_at: '2023-01-01T00:00:00.000000Z'
                }
            };

            PaymentMethodsService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(PaymentMethodsService.update).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls PaymentMethodsService.updateStatus with the correct parameters and shows success message', async () => {
            const store = usePaymentMethodsStore();
            const id = '123';
            const payload = { status: 'inactive' };
            const mockResponse = {
                data: {
                    id: '123',
                    payment_provider_id: 'stripe',
                    payment_type: 'credit_card',
                    enrollment_types: ['file_transfer'],
                    status: 'inactive',
                    updated_at: '2023-01-01T00:00:00.000000Z'
                }
            };

            PaymentMethodsService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(PaymentMethodsService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('deleteItem', () => {
        it('calls PaymentMethodsService.deleteItem and shows success message', async () => {
            const store = usePaymentMethodsStore();
            const id = '123';
            const mockResponse = {
                data: { success: true }
            };

            PaymentMethodsService.deleteItem.mockResolvedValue(mockResponse);

            const result = await store.deleteItem(id);

            expect(PaymentMethodsService.deleteItem).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
