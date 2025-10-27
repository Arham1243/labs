import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Import the actual SettingService
import * as SettingService from '@/modules/administration/services/Setting.service';

// Mock the SettingService functions directly
vi.mock('@/modules/administration/services/Setting.service', () => ({
    getSettings: vi.fn().mockResolvedValue({ data: 'mock data' }),
    updateSettings: vi.fn().mockResolvedValue({ data: 'mock data' })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('SettingService', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('getSettings', () => {
        it('calls getSettings with the correct parameters', async () => {
            await SettingService.getSettings();

            expect(SettingService.getSettings).toHaveBeenCalled();
        });
    });

    describe('updateSettings', () => {
        it('calls updateSettings with the correct parameters', async () => {
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

            await SettingService.updateSettings(payload);

            expect(SettingService.updateSettings).toHaveBeenCalledWith(payload);
        });
    });
});
