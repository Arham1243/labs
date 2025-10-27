import AppLayout from '@/layout/AppLayout.vue';

export default [
    {
        path: '/clients',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: '',
                meta: {
                    breadcrumb: ['Clients'],
                    permission: ['view clients', 'view holdings'],
                    hasTabs: true
                },
                component: () => import('@/modules/clients/views/index.vue'),
                children: [
                    {
                        path: 'clients',
                        name: 'Clients',
                        meta: {
                            breadcrumb: ['Clients'],
                            permission: 'view clients'
                        },
                        component: () =>
                            import('@/modules/clients/views/clients.vue')
                    },
                    {
                        path: 'clients/holdings',
                        name: 'Holdings',
                        meta: {
                            breadcrumb: ['Holdings'],
                            permission: 'view holdings'
                        },
                        component: () =>
                            import('@/modules/clients/views/holdings.vue')
                    }
                ]
            },
            {
                path: ':id/details',
                name: 'Client Details',
                props: true,
                meta: {
                    breadcrumb: ['Clients', 'Client Details'],
                    permission: 'view clients'
                },
                component: () =>
                    import('@/modules/clients/views/client/details.vue')
            },
            {
                path: ':id/edit',
                name: 'Client Edit',
                props: true,
                meta: {
                    disableLinks: true,
                    breadcrumb: ['Clients', 'Client Edit'],
                    permission: 'update clients'
                },
                component: () =>
                    import('@/modules/clients/views/client/edit.vue')
            },
            {
                path: ':clientId/business-units/:id/details',
                name: 'Business Unit Details',
                props: true,
                meta: {
                    disableLinks: true,
                    breadcrumb: ['Business Unit', 'Business Unit Details'],
                    permission: 'view business units'
                },
                component: () =>
                    import('@/modules/clients/views/business-unit/details.vue')
            },
            {
                path: ':clientId/business-units/:id/edit',
                name: 'Business Unit Edit',
                props: true,
                meta: {
                    disableLinks: true,
                    breadcrumb: ['Business Unit', 'Business Unit Edit'],
                    permission: 'update business units'
                },
                component: () =>
                    import('@/modules/clients/views/business-unit/edit.vue')
            },
            {
                path: ':clientId/new-business-unit',
                name: 'New Business Unit Stepper',
                meta: {
                    breadcrumb: ['Business Units', 'New Business Unit'],
                    permission: 'create business units'
                },
                component: () =>
                    import(
                        '@/modules/clients/views/business-unit/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id',
                        name: 'New Business Unit',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: ['Business Units', 'New Business Unit'],
                            permission: 'create business units'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/business-unit/new/details.vue'
                            )
                    },
                    {
                        path: ':id/billing',
                        name: 'New Business Unit Step 2',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: ['Business Units', 'New Business Unit'],
                            permission: [
                                'create business units',
                                'update business units'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/business-unit/new/billing.vue'
                            )
                    },
                    {
                        path: ':id/contacts',
                        name: 'New Business Unit Step 3',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: ['Business Units', 'New Business Unit'],
                            permission: [
                                'create business units',
                                'update business units'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/business-unit/new/contacts.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Business Unit Step 4',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: ['Business Units', 'New Business Unit'],
                            permission: 'update business units'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/business-unit/new/review.vue'
                            )
                    }
                ]
            },
            {
                path: 'holdings/:id/details',
                name: 'Holding Details',
                props: true,
                meta: {
                    breadcrumb: ['Holdings', 'Holding Details'],
                    permission: 'view holdings'
                },
                component: () =>
                    import('@/modules/clients/views/holding/details.vue')
            },
            {
                path: 'holdings/:id/edit',
                name: 'Holding Edit',
                props: true,
                meta: {
                    disableLinks: true,
                    breadcrumb: ['Holdings', 'Holding Details'],
                    permission: 'update holdings'
                },
                component: () =>
                    import('@/modules/clients/views/holding/edit.vue')
            },
            {
                path: 'new-holding',
                name: 'New Holding Stepper',
                meta: {
                    breadcrumb: ['Holdings', 'New Holding'],
                    permission: 'create holdings'
                },
                component: () =>
                    import('@/modules/clients/views/holding/new/index.vue'),
                children: [
                    {
                        path: ':id',
                        name: 'New Holding',
                        props: true,
                        meta: {
                            breadcrumb: ['Holdings', 'New Holding'],
                            permission: 'create holdings'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/holding/new/details.vue'
                            )
                    },
                    {
                        path: ':id/contacts',
                        name: 'New Holding Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Holdings', 'New Holding'],
                            permission: ['create holdings', 'update holdings']
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/holding/new/contacts.vue'
                            )
                    },
                    {
                        path: ':id/associated-clients',
                        name: 'New Holding Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Holdings', 'New Holding'],
                            permission: ['view clients', 'update holdings']
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/holding/new/clients.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Holding Step 4',
                        props: true,
                        meta: {
                            breadcrumb: ['Holdings', 'New Holding'],
                            permission: 'update holdings'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/holding/new/review.vue'
                            )
                    }
                ]
            },
            {
                path: 'new-client',
                name: 'New Client Stepper',
                meta: {
                    breadcrumb: ['Clients', 'New Client'],
                    permission: 'create clients'
                },
                component: () =>
                    import('@/modules/clients/views/client/new/index.vue'),
                children: [
                    {
                        path: ':id',
                        name: 'New Client',
                        props: true,
                        meta: {
                            breadcrumb: ['Clients', 'New Client'],
                            permission: 'create clients'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/client/new/details.vue'
                            )
                    },
                    {
                        path: ':id/billing',
                        name: 'New Client Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Clients', 'New Client'],
                            permission: ['create clients', 'update clients']
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/client/new/billing.vue'
                            )
                    },
                    {
                        path: ':id/contacts',
                        name: 'New Client Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Clients', 'New Client'],
                            permission: ['create clients', 'update clients']
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/client/new/contacts.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Client Step 4',
                        props: true,
                        meta: {
                            breadcrumb: ['Clients', 'New Client'],
                            permission: 'update clients'
                        },
                        component: () =>
                            import(
                                '@/modules/clients/views/client/new/review.vue'
                            )
                    }
                ]
            }
        ]
    }
];
