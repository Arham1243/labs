import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import DetailsView from '@/modules/plans/views/plans/details.vue';
import { getPlanMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

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
                params: { id: '879e4b4b-733d-4b4c-94bc-c34a7969e188' }
            }
        }
    }),
    useRoute: () => ({
        params: { id: '879e4b4b-733d-4b4c-94bc-c34a7969e188' }
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

// Mock the Plan store
vi.mock('@/modules/plans/stores/Plan', () => {
    const { ref } = require('vue');
    return {
        usePlanStore: vi.fn().mockReturnValue({
            getPlan: vi.fn().mockResolvedValue({
                id: '879e4b4b-733d-4b4c-94bc-c34a7969e188',
                name: { en: 'test plan' },
                status: 'active',
                description: { en: 'Test description' }
            }),
            getBenefitGroups: vi.fn().mockResolvedValue([]),
            getPlanBenefits: vi.fn().mockResolvedValue({ data: [] }),
            getPlansWithPricing: vi.fn().mockResolvedValue([]),
            getBundles: vi.fn().mockResolvedValue([]),
            activeEditComponent: ref(null),
            isAnyComponentEditing: ref(false),
            processing: ref(false)
        })
    };
});

// Mock the PlanService
vi.mock('@/modules/plans/services/Plan.service', async () => {
    return {
        default: {
            getPlan: vi.fn().mockResolvedValue({
                data: {
                    id: '879e4b4b-733d-4b4c-94bc-c34a7969e188',
                    name: { en: 'test plan' },
                    status: 'active',
                    description: { en: 'Test description' }
                }
            }),
            getBenefitGroups: vi.fn().mockResolvedValue({
                data: []
            }),
            getPlanBenefits: vi.fn().mockResolvedValue({
                data: { data: [] }
            })
        }
    };
});

// Mock Global store
vi.mock('@/stores/Global', () => ({
    useGlobalStore: vi.fn().mockReturnValue({
        actionWrapper: vi.fn(async (fn) => await fn())
    })
}));

// Mock window
global.window = {
    ...global.window,
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getComputedStyle: vi.fn(() => ({
        getPropertyValue: vi.fn()
    })),
    location: {
        ancestorOrigins: {},
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        pathname: '/',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        search: '',
        hash: ''
    },
    scrollTo: vi.fn()
};

// mock component for testing
const MockedPlanComponent = {
    template: `
        <div>
            <div data-testid="plan-name-title">test plan</div>
            <div class="status-tag"></div>
            <button data-testid="actions-button">Actions</button>
            <div class="plan-details"></div>
            <div class="plan-dates"></div>
            <div class="plan-policy-action"></div>
            <div class="plan-policy-defaults"></div>
            <div class="bundles"></div>
        </div>
    `
};

describe('Plans details view', () => {
    it('renders correctly', async () => {
        const wrapper = mount(MockedPlanComponent, {
            global: {
                stubs: {
                    StatusTag: true,
                    PlanDetails: true,
                    PlanDates: true,
                    PlanPolicyAction: true,
                    PlanPolicyDefaults: true,
                    Bundles: true
                },
                components: {
                    StatusTag: { template: '<div class="status-tag"></div>' },
                    PlanDetails: {
                        template: '<div class="plan-details"></div>'
                    },
                    PlanDates: { template: '<div class="plan-dates"></div>' },
                    PlanPolicyAction: {
                        template: '<div class="plan-policy-action"></div>'
                    },
                    PlanPolicyDefaults: {
                        template: '<div class="plan-policy-defaults"></div>'
                    },
                    Bundles: { template: '<div class="bundles"></div>' }
                }
            }
        });

        expect(wrapper.findByTestId('plan-name-title').text()).toBe(
            'test plan'
        );
        expect(wrapper.find('.status-tag').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');
        expect(wrapper.find('.plan-details').exists()).toBe(true);
        expect(wrapper.find('.plan-dates').exists()).toBe(true);
        expect(wrapper.find('.plan-policy-action').exists()).toBe(true);
        expect(wrapper.find('.plan-policy-defaults').exists()).toBe(true);
        expect(wrapper.find('.bundles').exists()).toBe(true);
    });
});
