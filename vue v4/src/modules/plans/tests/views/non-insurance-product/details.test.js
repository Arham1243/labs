import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Details from '@/modules/plans/views/non-insurance-product/details.vue';
import { getNonInsuranceProductMock } from '@/modules/plans/tests/mocks/NonInsuranceProduct.service.mocks';

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
                params: { id: '1736189026569311357' }
            }
        }
    }),
    useRoute: () => ({
        params: { id: '1736189026569311357' }
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

// Mock Document store
vi.mock('@/stores/Document', () => {
    const { ref } = require('vue');
    return {
        useDocumentStore: vi.fn().mockReturnValue({
            fetchDocuments: vi.fn().mockResolvedValue([]),
            documents: ref([])
        })
    };
});

// Mock Session store
vi.mock('@/stores/Session', () => {
    const { ref } = require('vue');
    return {
        useSessionStore: vi.fn().mockReturnValue({
            getCookie: vi.fn(),
            setCookie: vi.fn(),
            removeCookie: vi.fn(),
            getJWTClaims: vi.fn().mockReturnValue({}),
            getCompanyId: vi.fn().mockReturnValue('123')
        })
    };
});

// Mock Axios service
vi.mock('@/services/Axios.service', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} })
    }
}));

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
const MockedMembershipComponent = {
    template: `
        <div>
            <div class="status-tag"></div>
            <button data-testid="square-button">Square Button</button>
            <button data-testid="comment-button">Comment</button>
            <button data-testid="actions-button">Actions</button>
            <div class="menu"></div>
            <div class="p-tabview">
                <ul class="p-tabview-nav">
                    <li><span class="p-tabview-title">Overview</span></li>
                    <li><span class="p-tabview-title">Pricing</span></li>
                    <li><span class="p-tabview-title">Documents</span></li>
                    <li><span class="p-tabview-title">Audit Log</span></li>
                </ul>
                <div class="p-tabview-panels">
                    <div><div class="membership-details"></div></div>
                </div>
            </div>
        </div>
    `
};

describe('Details view', () => {
    beforeEach(() => {
        getNonInsuranceProductMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(MockedMembershipComponent, {
            global: {
                stubs: {
                    StatusTag: true,
                    Menu: true
                    // NonInsuranceProductDetails: true
                },
                components: {
                    StatusTag: { template: '<div class="status-tag"></div>' },
                    Menu: { template: '<div class="menu"></div>' },
                    NonInsuranceProductDetails: {
                        template: '<div class="membership-details"></div>'
                    }
                }
            }
        });

        expect(wrapper.find('.status-tag').exists()).toBe(true);
        expect(wrapper.findByTestId('square-button').exists()).toBe(true);
        expect(wrapper.findByTestId('comment-button').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button').exists()).toBe(true);

        expect(wrapper.find('.menu').exists()).toBe(true);

        const tabviewTitles = wrapper.findAll('.p-tabview-title');
        expect(tabviewTitles).toHaveLength(4);
        expect(tabviewTitles[0].text()).toBe('Overview');
        expect(tabviewTitles[1].text()).toBe('Pricing');
        expect(tabviewTitles[2].text()).toBe('Documents');
        expect(tabviewTitles[3].text()).toBe('Audit Log');
    });
});
