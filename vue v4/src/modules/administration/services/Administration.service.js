import settingsData from '@/modules/administration/mock/settings.json';

export const getSettings = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: settingsData }), 100);
    });
};
