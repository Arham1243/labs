import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCountryStore } from '@/modules/administration/stores';
import { CountryService } from '@/modules/administration/services';

// Mock the CountryService
vi.mock('@/modules/administration/services', () => ({
    CountryService: {
        searchItems: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn()
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

describe('CountryStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('searchItems', () => {
        it('calls CountryService.searchItems and returns the data', async () => {
            const store = useCountryStore();
            const payload = { name: 'United States' };
            const params = { page: 1, per_page: 10 };
            const mockResponse = {
                data: {
                    data: [
                        {
                            id: '123',
                            name: 'United States',
                            code: 'US',
                            status: 'active'
                        }
                    ],
                    meta: {
                        current_page: 1,
                        per_page: 10,
                        total: 1
                    }
                }
            };

            CountryService.searchItems.mockResolvedValue(mockResponse);

            const result = await store.searchItems(payload, params);

            expect(CountryService.searchItems).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('create', () => {
        it('calls CountryService.create with the correct parameters and shows success message', async () => {
            const store = useCountryStore();
            const payload = {
                name: 'New Country',
                code: 'NC',
                status: 'active'
            };
            const mockResponse = {
                data: {
                    id: '456',
                    name: 'New Country',
                    code: 'NC',
                    status: 'active'
                }
            };

            CountryService.create.mockResolvedValue(mockResponse);

            const result = await store.create(payload);

            expect(CountryService.create).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('update', () => {
        it('calls CountryService.update with the correct parameters and shows success message', async () => {
            const store = useCountryStore();
            const id = '123';
            const payload = {
                name: 'Updated Country',
                code: 'UC'
            };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'Updated Country',
                    code: 'UC',
                    status: 'active'
                }
            };

            CountryService.update.mockResolvedValue(mockResponse);

            const result = await store.update(id, payload);

            expect(CountryService.update).toHaveBeenCalledWith(id, payload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateStatus', () => {
        it('calls CountryService.updateStatus with the correct parameters and shows success message', async () => {
            const store = useCountryStore();
            const id = '123';
            const payload = { status: 'inactive' };
            const mockResponse = {
                data: {
                    id: '123',
                    name: 'United States',
                    code: 'US',
                    status: 'inactive'
                }
            };

            CountryService.updateStatus.mockResolvedValue(mockResponse);

            const result = await store.updateStatus(id, payload);

            expect(CountryService.updateStatus).toHaveBeenCalledWith(
                id,
                payload
            );
            expect(result).toEqual(mockResponse.data);
        });
    });
});
