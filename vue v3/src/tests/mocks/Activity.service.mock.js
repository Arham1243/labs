import { vi } from 'vitest';
import { ref } from 'vue';

export const activityTemplatesMock = [
    {
        id: '775622981897232384',
        title: 'test title',
        content: '<p>test content</p>',
        created_at: '2025-06-17T19:36:57.000000Z',
        updated_at: '2025-06-17T19:36:57.000000Z'
    }
];

export const activityMock = {
    id: '775622981897232384',
    title: 'test title',
    content: '<p>test content</p>',
    created_at: '2025-06-17T19:36:57.000000Z',
    updated_at: '2025-06-17T19:36:57.000000Z'
};

export const currentActivityDisplayModeMock = ref('one-column');
export const currentModule = ref('submission');
export const currentModuleId = ref(123);

const mutateActivityMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        data: activityMock,
        status: 'success'
    }));

const getAllActivityTemplatesMock = () =>
    vi.fn(() => ({
        loading: false,
        data: activityTemplatesMock,
        status: 'success'
    }));

export const useActivityStoreMock = () => ({
    mutateActivity: mutateActivityMock(),
    currentActivityDisplayMode: { value: 'list' },
    setCurrentModule: vi.fn(),
    setCurrentActivityDisplayMode: () => currentActivityDisplayModeMock.value,
    getAllActivityTemplates: getAllActivityTemplatesMock()
});
