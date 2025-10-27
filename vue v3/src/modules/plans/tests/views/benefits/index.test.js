import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/benefits/index.vue';
import { updateAbility } from '@/plugins/ability';

// Mock useEditState
vi.mock('@/modules/plans/composables/useEditState', () => {
    const { ref } = require('vue');
    return {
        provideEditState: () => ({
            activeEditComponent: ref(null),
            showUnsavedDialog: ref(false),
            shouldUseLazy: ref(true),
            confirmDiscard: vi.fn(),
            cancelDiscard: vi.fn(),
            clearActiveComponent: vi.fn(),
            triggerCancelEdit: vi.fn(),
            setForceSkipConfirmation: vi.fn(),
            setupTabPrevention: vi.fn(),
            clearTabListeners: vi.fn(),
            registerCancelCallback: vi.fn(),
            unregisterCancelCallback: vi.fn()
        }),
        useEditState: () => ({
            activeEditComponent: ref(null),
            isAnyComponentEditing: ref(false),
            registerCancelCallback: vi.fn(),
            unregisterCancelCallback: vi.fn()
        })
    };
});

// Mock vue3-cookies
vi.mock('vue3-cookies', () => ({
    default: {
        VueCookies: {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
            isKey: vi.fn(),
            keys: vi.fn()
        }
    }
}));

describe('Benefits index view', () => {
    it('index renders correctly', async () => {
        updateAbility([
            'create benefit categories',
            'create benefits',
            'view benefits',
            'view benefit categories'
        ]);
        // Preparation
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('Benefits');
        expect(wrapper.findByTestId('add-new-benefit-button').text()).toBe(
            'New'
        );

        const lis = wrapper.findAll('li');

        expect(lis[0].text()).toBe('Benefits');
        expect(lis[1].text()).toBe('Categories');
    });
});
