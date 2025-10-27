import { describe, expect, it, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { render, fireEvent } from '@testing-library/vue';
import BenefitServices from '@/modules/plans/components/benefits/BenefitServices.vue';
import { updateAbility } from '@/plugins/ability';

// Mock the useEditState composable
vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: vi.fn(),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn((callback) => callback()),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn()
    })
}));

// Mock the child components
vi.mock(
    '@/modules/plans/components/benefits/forms/BenefitServicesForm.vue',
    () => ({
        default: {
            name: 'BenefitServicesForm',
            render: () => null
        }
    })
);

vi.mock(
    '@/modules/plans/components/benefits/partials/CodeGroupsSection.vue',
    () => ({
        default: {
            name: 'CodeGroupsSection',
            render: () => null,
            methods: {
                showRemoveAllDialog: vi.fn()
            }
        }
    })
);

// Mock the global properties
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        getCurrentInstance: () => ({
            appContext: {
                config: {
                    globalProperties: {
                        $ability: {
                            can: () => true
                        },
                        $t: (key) => key
                    }
                }
            }
        })
    };
});

describe('BenefitServices', () => {
    beforeEach(() => {
        updateAbility(['update benefits']);
    });

    it('renders without crashing', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services'
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders with custom title', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services',
                title: 'Custom Title'
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders with isHide prop', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services',
                isHide: true
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders with isNew prop', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services',
                isNew: true
            },
            global: {
                stubs: {
                    BenefitServicesForm: {
                        name: 'BenefitServicesForm',
                        template:
                            '<div data-testid="benefit-services-form">Benefit Services Form</div>'
                    }
                }
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders with isReview prop', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services',
                isReview: true
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });

    it('renders with all props', async () => {
        const { container } = render(BenefitServices, {
            props: {
                id: '123',
                componentId: 'benefit-services',
                title: 'Custom Title',
                isNew: true,
                isHide: true,
                isReview: true
            }
        });

        await flushPromises();

        // Check that the component renders
        expect(container.querySelector('div')).toBeTruthy();
    });
});
