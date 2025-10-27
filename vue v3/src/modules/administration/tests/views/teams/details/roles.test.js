import { describe, expect, it, vi } from 'vitest';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';

vi.mock('@/modules/administration/stores', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useTeamStore: () => ({
            currentTeam: { id: 1 }
        })
    };
});

describe('Team > roles index view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'TeamRoles', params: { id: 1 } });
        expect(route.path).toBe('/administration/teams/1/roles');
    });
});
