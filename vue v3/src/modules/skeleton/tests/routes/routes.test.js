import { describe, expect, it } from 'vitest';
import routes from '@/modules/skeleton/routes/routes.js';
import AppLayout from '@/layout/AppLayout.vue';

describe('Skeleton routes', () => {
    it('has the correct base path', () => {
        expect(routes[0].path).toBe('/skeleton');
    });

    it('uses AppLayout as the parent component', () => {
        expect(routes[0].component).toBe(AppLayout);
    });

    it('has a child route for the skeleton index', () => {
        const childRoute = routes[0].children[0];
        expect(childRoute.path).toBe('/skeleton');
        expect(childRoute.name).toBe('Skeleton');
        expect(childRoute.meta.breadcrumb).toEqual(['Skeleton']);
    });

    it('lazy loads the SkeletonIndex component', () => {
        const childRoute = routes[0].children[0];
        // We can't directly test the dynamic import, but we can check that it's a function
        expect(typeof childRoute.component).toBe('function');
    });
});
