import AppLayout from '@/layout/AppLayout.vue';

export default [
    {
        path: '/skeleton',
        component: AppLayout,
        children: [
            {
                path: '/skeleton',
                name: 'Skeleton',
                meta: { breadcrumb: ['Skeleton'] },
                component: () =>
                    import('@/modules/skeleton/components/SkeletonIndex.vue')
            }
        ]
    },
    {
        path: '/invoices',
        component: AppLayout,
        children: [
            {
                path: '/invoices',
                name: 'Invoices',
                meta: {
                    breadcrumb: ['Invoices'],
                    permission: ['view invoices']
                },
                component: () => import('@/modules/accounting/views/index.vue')
            },
            {
                path: ':id',
                name: 'Invoice Details',
                component: () =>
                    import('@/modules/accounting/views/InvoiceView.vue'),
                meta: {
                    breadcrumb: ['Invoices', 'Invoice Details'],
                    permission: ['view invoices']
                }
            }
        ]
    }
];
