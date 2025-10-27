import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import PermissionsView from '@/modules/administration/views/roles/details/permissions.vue';

// Mock the RoleStore
vi.mock('@/modules/administration/stores', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useRoleStore: () => ({
            currentRole: {
                id: '1',
                name: 'Admin Role',
                description: 'Administrator role',
                type: 'company'
            }
        })
    };
});

// Mock event bus
const emitMock = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: () => ({
        emit: emitMock
    })
}));

// Mock PermissionsGroup component
vi.mock(
    '@/modules/administration/components/roles/PermissionsGroup.vue',
    () => ({
        default: {
            name: 'PermissionsGroup'
        }
    })
);

describe('Role permissions view', () => {
    let router;

    beforeEach(() => {
        vi.clearAllMocks();

        router = createRouter({
            history: createWebHistory(),
            routes
        });
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({
            name: 'RolePermissions',
            params: { id: '1' }
        });
        expect(route.path).toBe('/administration/roles/1');
    });

    it('renders the PermissionsGroup component', async () => {
        const wrapper = mount(PermissionsView, {
            global: {
                stubs: {
                    PermissionsGroup: true,
                    RouterView: true
                },
                mocks: {
                    $route: {
                        params: { id: '1' },
                        name: 'RolePermissions'
                    }
                }
            }
        });

        expect(wrapper.find('permissions-group-stub').exists()).toBe(true);
    });

    it('emits updateDetailsBreadcrumb event with role name on mount', async () => {
        mount(PermissionsView, {
            global: {
                stubs: {
                    PermissionsGroup: true,
                    RouterView: true
                },
                mocks: {
                    $route: {
                        params: { id: '1' },
                        name: 'RolePermissions'
                    }
                }
            }
        });

        expect(emitMock).toHaveBeenCalledWith(
            'updateDetailsBreadcrumb',
            'Admin Role'
        );
    });
});
