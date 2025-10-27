import { vi } from 'vitest';
import * as SettingService from '@/modules/administration/services/Setting.service';

export const getSettingsMock = () =>
    vi.spyOn(SettingService, 'getSettings').mockResolvedValue({
        data: {
            data: {
                default_language: {
                    id: '1738083080559982310',
                    code: 'en',
                    name: 'English'
                },
                default_payment_gateway: 'chase',
                currency: 'USD',
                date_time: {
                    short_date: 'MM/dd/yy',
                    long_date: 'dddd, MMMM d,yyyy',
                    short_time: 'hh:mm tt',
                    long_time: 'hh:mm:ss tt',
                    first_day_of_week: 'Sunday'
                }
            }
        }
    });

export const updateSettingsMock = () =>
    vi.spyOn(SettingService, 'updateSettings').mockResolvedValue({
        data: {
            success: true
        }
    });
