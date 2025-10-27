import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingStore } from '@/modules/administration/stores';
import { SettingService } from '@/modules/administration/services';

// Mock the SettingService
vi.mock('@/modules/administration/services', () => ({
    SettingService: {
        getSettings: vi.fn(),
        updateSettings: vi.fn()
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

describe('SettingStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getSettings', () => {
        it('calls SettingService.getSettings and returns the data', async () => {
            const store = useSettingStore();
            const payload = { type: 'currency' };
            const params = { include: 'details' };
            const mockResponse = {
                data: {
                    currency: 'USD',
                    date_time: {
                        short_date: 'MM/DD/YYYY',
                        long_date: 'MMMM D, YYYY',
                        short_time: 'h:mm A',
                        long_time: 'h:mm:ss A',
                        first_day_of_week: 0
                    }
                }
            };

            SettingService.getSettings.mockResolvedValue(mockResponse);

            const result = await store.getSettings(payload, params);

            expect(SettingService.getSettings).toHaveBeenCalledWith(
                payload,
                params
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('updateSettings', () => {
        it('calls SettingService.updateSettings with the correct parameters and shows success message', async () => {
            const store = useSettingStore();
            const payload = {
                default_currency: 'USD',
                date_time: {
                    short_date: 'MM/DD/YYYY',
                    long_date: 'MMMM D, YYYY',
                    short_time: 'h:mm A',
                    long_time: 'h:mm:ss A',
                    first_day_of_week: 0
                }
            };
            const mockResponse = {
                data: {
                    currency: 'USD',
                    date_time: {
                        short_date: 'MM/DD/YYYY',
                        long_date: 'MMMM D, YYYY',
                        short_time: 'h:mm A',
                        long_time: 'h:mm:ss A',
                        first_day_of_week: 0
                    }
                }
            };

            SettingService.updateSettings.mockResolvedValue(mockResponse);

            const result = await store.updateSettings(payload);

            expect(SettingService.updateSettings).toHaveBeenCalledWith(payload);
            expect(result).toEqual(mockResponse.data);
        });
    });
});
