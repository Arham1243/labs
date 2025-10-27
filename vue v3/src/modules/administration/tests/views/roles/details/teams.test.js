import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import TeamsView from '@/modules/administration/views/roles/details/teams.vue';

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

// Mock TeamTable component
vi.mock(
    '@/modules/administration/components/roles/tables/TeamTable.vue',
    () => ({
        default: {
            name: 'TeamTable'
        }
    })
);

describe('Role teams view', () => {
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
            name: 'RoleTeams',
            params: { id: '1' }
        });
        expect(route.path).toBe('/administration/roles/1/teams');
    });

    it('emits updateDetailsBreadcrumb event with role name on mount', async () => {
        mount(TeamsView, {
            global: {
                stubs: {
                    TeamTable: true,
                    RouterView: true
                },
                mocks: {
                    $route: {
                        params: { id: '1' },
                        name: 'RoleTeams'
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
