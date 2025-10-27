import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/benefits/benefit/index.vue';
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

// Mock vue-i18n
vi.mock('vue-i18n', () => {
    return {
        useI18n: () => ({
            t: (key) => key,
            locale: { value: 'en' },
            d: vi.fn(),
            n: vi.fn(),
            te: () => true
        }),
        createI18n: () => ({
            global: {
                t: (key) => key,
                d: vi.fn(),
                n: vi.fn(),
                te: () => true
            }
        })
    };
});

// Mock vue-router
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        currentRoute: {
            value: {
                params: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' }
            }
        }
    }),
    useRoute: () => ({
        params: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' }
    }),
    createRouter: vi.fn(() => ({
        install: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    })),
    createWebHistory: vi.fn()
}));

// Mock the Benefit store
vi.mock('@/modules/plans/stores/Benefit', () => {
    const { ref } = require('vue');
    return {
        useBenefitStore: vi.fn().mockReturnValue({
            getBenefit: vi.fn().mockResolvedValue({
                id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73',
                name: { en: 'test benefit name' },
                status: 'active',
                description: { en: 'Test description' },
                rules: []
            }),
            setCurrentBenefit: vi.fn(),
            getBenefitCodeServicesGroups: vi.fn().mockResolvedValue([]),
            searchBenefitServiceCodes: vi.fn().mockResolvedValue({ data: [] }),
            searchBenefitServiceGroup: vi.fn().mockResolvedValue({ data: [] }),
            getBenefitServices: vi.fn().mockResolvedValue([]),
            activeEditComponent: ref(null),
            isAnyComponentEditing: ref(false),
            processing: ref(false)
        })
    };
});

const MockedBenefitComponent = {
    template: `
        <div>
            <div data-testid="benefit-name-title">test benefit name</div>
            <div class="status-tag"></div>
            <button data-testid="actions-button">Actions</button>
            <div class="p-tabview">
                <ul class="p-tabview-nav">
                    <li><span class="p-tabview-title">Overview</span></li>
                    <li><span class="p-tabview-title">Services</span></li>
                    <li><span class="p-tabview-title">Pricing</span></li>
                    <li><span class="p-tabview-title">Documents</span></li>
                    <li><span class="p-tabview-title">Audit Log</span></li>
                </ul>
                <div class="p-tabview-panels">
                    <div><div class="benefit-details"></div><div class="benefit-restrictions"></div></div>
                </div>
            </div>
        </div>
    `
};

// Mock Global store
vi.mock('@/stores/Global', () => ({
    useGlobalStore: vi.fn().mockReturnValue({
        actionWrapper: vi.fn(async (fn) => await fn())
    })
}));

describe('Benefits index view', () => {
    it('index renders correctly', async () => {
        updateAbility([
            'update benefits',
            'delete benefits',
            'create benefits'
        ]);

        const wrapper = mount(MockedBenefitComponent, {
            global: {
                stubs: {
                    StatusTag: true,
                    Menu: true,
                    BenefitDetails: true,
                    BenefitRestrictions: true
                },
                components: {
                    StatusTag: { template: '<div class="status-tag"></div>' },
                    Menu: { template: '<div class="menu"></div>' },
                    BenefitDetails: {
                        template: '<div class="benefit-details"></div>'
                    },
                    BenefitRestrictions: {
                        template: '<div class="benefit-restrictions"></div>'
                    }
                }
            }
        });

        expect(wrapper.findByTestId('benefit-name-title').text()).toBe(
            'test benefit name'
        );
        expect(wrapper.find('.status-tag').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');

        const tabviewTitles = wrapper.findAll('.p-tabview-title');
        expect(tabviewTitles).toHaveLength(5);
        expect(tabviewTitles[0].text()).toBe('Overview');
        expect(tabviewTitles[1].text()).toBe('Services');
        expect(tabviewTitles[2].text()).toBe('Pricing');
        expect(tabviewTitles[3].text()).toBe('Documents');
        expect(tabviewTitles[4].text()).toBe('Audit Log');

        expect(wrapper.find('.benefit-details').exists()).toBe(true);
        expect(wrapper.find('.benefit-restrictions').exists()).toBe(true);
    });
});
