import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue';
import { useActivityStoreMock } from '@/tests/mocks/Activity.service.mock';

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key // simple passthrough mock
    })
}));

vi.mock('@/stores/Activity', () => ({
    useActivityStore: vi.fn(() => ({
        ...useActivityStoreMock()
    }))
}));

vi.mock('vue-router', () => ({
    useRoute: () => ({
        query: { module: 'all' }
    })
}));

// Mock subcomponents if necessary
const stubDropdown = { template: '<div class="dropdown-stub"></div>' };
const stubSearch = { template: '<input class="search-stub" />' };
const stubButton = { template: '<button class="button-stub"></button>' };
const stubMenu = {
    template: '<div class="menu-stub"></div>',
    methods: {
        toggle: vi.fn()
    }
};
const stubSelectButton = {
    template: '<div class="selectbutton-stub" @click="$emit(\'click\')"></div>'
};

describe('ActivityFilterBar.vue', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(ActivityFilterBar, {
            global: {
                stubs: {
                    Dropdown: stubDropdown,
                    Search: stubSearch,
                    Button: stubButton,
                    Menu: stubMenu,
                    SelectButton: stubSelectButton
                }
            }
        });
    });

    it('renders dropdown, search, button, menu, selectbutton', () => {
        expect(wrapper.find('.dropdown-stub').exists()).toBe(true);
        expect(wrapper.find('.search-stub').exists()).toBe(true);
        expect(wrapper.find('.button-stub').exists()).toBe(true);
        expect(wrapper.find('.menu-stub').exists()).toBe(true);
        expect(wrapper.find('.selectbutton-stub').exists()).toBe(true);
    });
});
