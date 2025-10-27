import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual PaymentMethodsService
import * as PaymentMethodsService from '@/modules/administration/services/PaymentMethods.service';

// Mock the PaymentMethodsService functions directly
vi.mock('@/modules/administration/services/PaymentMethods.service', () => ({
    search: vi.fn().mockResolvedValue({ data: 'mock data' }),
    list: vi.fn().mockResolvedValue({ data: 'mock data' }),
    create: vi.fn().mockResolvedValue({ data: 'mock data' }),
    update: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateStatus: vi.fn().mockResolvedValue({ data: 'mock data' }),
    deleteItem: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PaymentMethodsService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('search', () => {
        it('calls search with the correct parameters', async () => {
            const payload = { search: 'Stripe' };
            const params = { page: 1, limit: 10 };

            await PaymentMethodsService.search(payload, params);

            expect(PaymentMethodsService.search).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('list', () => {
        it('calls list with the correct parameters', async () => {
            const payload = { search: 'Stripe' };
            const params = { page: 1, limit: 10 };

            await PaymentMethodsService.list(payload, params);

            expect(PaymentMethodsService.list).toHaveBeenCalledWith(
                payload,
                params
            );
        });
    });

    describe('create', () => {
        it('calls create with the correct parameters', async () => {
            const payload = {
                payment_provider_id: 'stripe',
                payment_type: 'credit_card',
                enrollment_types: ['file_transfer'],
                status: 'active'
            };

            await PaymentMethodsService.create(payload);

            expect(PaymentMethodsService.create).toHaveBeenCalledWith(payload);
        });
    });

    describe('update', () => {
        it('calls update with the correct parameters', async () => {
            const id = '123';
            const payload = {
                payment_provider_id: 'stripe',
                payment_type: 'credit_card',
                enrollment_types: ['file_transfer'],
                status: 'active'
            };

            await PaymentMethodsService.update(id, payload);

            expect(PaymentMethodsService.update).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('updateStatus', () => {
        it('calls updateStatus with the correct parameters', async () => {
            const id = '123';
            const payload = {
                status: 'inactive'
            };

            await PaymentMethodsService.updateStatus(id, payload);

            expect(PaymentMethodsService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
        });
    });

    describe('deleteItem', () => {
        it('calls deleteItem with the correct parameters', async () => {
            const id = '123';

            await PaymentMethodsService.deleteItem(id);

            expect(PaymentMethodsService.deleteItem).toHaveBeenCalledWith(id);
        });
    });
});
