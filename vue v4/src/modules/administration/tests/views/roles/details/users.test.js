import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import UsersView from '@/modules/administration/views/roles/details/users.vue';

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

// Mock UserTable component
vi.mock(
    '@/modules/administration/components/roles/tables/UserTable.vue',
    () => ({
        default: {
            name: 'UserTable'
        }
    })
);

describe('Role users view', () => {
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
            name: 'RoleUsers',
            params: { id: '1' }
        });
        expect(route.path).toBe('/administration/roles/1/users');
    });

    it('emits updateDetailsBreadcrumb event with role name on mount', async () => {
        mount(UsersView, {
            global: {
                stubs: {
                    UserTable: true,
                    RouterView: true
                },
                mocks: {
                    $route: {
                        params: { id: '1' },
                        name: 'RoleUsers'
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
