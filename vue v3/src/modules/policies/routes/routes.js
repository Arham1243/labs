import { toRaw } from 'vue';
import AppLayout from '@/layout/AppLayout.vue';

import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';

export default [
    {
        path: '/orders',
        component: AppLayout,
        children: [
            {
                path: '/orders',
                name: 'Orders',
                meta: { breadcrumb: ['Orders'] },
                component: () =>
                    import('@/modules/policies/views/orders/index.vue')
            },
            {
                path: ':clientId/:orderId',
                name: 'Order Details',
                meta: { breadcrumb: ['Orders', 'Order Details'] },
                component: () =>
                    import('@/modules/policies/views/orders/summary.vue')
            }
        ]
    },
    {
        path: '/policies',
        component: AppLayout,
        children: [
            {
                path: '/policies',
                name: 'Policies',
                meta: {
                    breadcrumb: ['Policies'],
                    permission: ['view policies']
                },
                component: () => import('@/modules/policies/views/index.vue')
            },
            {
                path: ':clientId/:policyId',
                name: 'Policy Details',
                meta: {
                    breadcrumb: ['Policies', 'Policy Details'],
                    permission: ['view policies']
                },
                component: () =>
                    import('@/modules/policies/views/policy/index.vue')
            },
            {
                path: 'order',
                name: 'Order',
                meta: { breadcrumb: ['Policies', 'Order'] },
                component: () =>
                    import('@/modules/policies/views/order/index.vue'),
                redirect: '/policies/order',
                children: [
                    {
                        path: '',
                        name: 'Add Applicants',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/AddApplicants.vue'
                            ),
                        beforeEnter: (to, from, next) => {
                            if (
                                toRaw(usePoliciesStore())
                                    .isOrderDetailsIncomplete.value
                            ) {
                                next('/policies');
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: 'match-columns',
                        name: 'Match Columns',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/MatchColumns.vue'
                            ),
                        beforeEnter: (to, from, next) => {
                            if (
                                toRaw(usePoliciesStore())
                                    .isOrderDetailsIncomplete.value ||
                                toRaw(useSmartTemplate())
                                    .unmatchedSystemFieldsCount.value == 0
                            ) {
                                next('/policies');
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: 'fix-format',
                        name: 'Fix Format',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/FixFormat.vue'
                            ),
                        beforeEnter: (to, from, next) => {
                            if (
                                toRaw(usePoliciesStore())
                                    .isOrderDetailsIncomplete.value
                            ) {
                                next('/policies');
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: 'review',
                        name: 'Review',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/Review.vue'
                            ),
                        beforeEnter: (to, from, next) => {
                            if (
                                toRaw(usePoliciesStore())
                                    .isOrderDetailsIncomplete.value
                            ) {
                                next('/policies');
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: 'summary',
                        name: 'Summary',
                        meta: {
                            permission: ['view policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/Summary.vue'
                            ),
                        beforeEnter: (to, from, next) => {
                            if (
                                toRaw(usePoliciesStore())
                                    .isOrderDetailsIncomplete.value
                            ) {
                                next('/policies');
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: 'payment',
                        name: 'Payment',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/Payment.vue'
                            )
                    },
                    {
                        path: 'success',
                        name: 'Success',
                        meta: {
                            permission: ['create policies']
                        },
                        component: () =>
                            import(
                                '@/modules/policies/components/order/Success.vue'
                            )
                    }
                ]
            }
        ]
    },
    {
        path: '/insureds',
        component: AppLayout,
        children: [
            {
                path: '/insureds',
                name: 'Insured Overview',
                meta: {
                    breadcrumb: ['Insured Overview'],
                    permission: ['view insureds']
                },
                component: () =>
                    import('@/modules/policies/views/insureds/index.vue')
            },
            {
                path: ':insuredId',
                name: 'Details',
                props: true,
                meta: {
                    breadcrumb: ['Insured Overview', 'Details'],
                    permission: ['view insureds']
                },
                component: () =>
                    import(
                        '@/modules/policies/views/insureds/InsuredOverview.vue'
                    )
            }
        ]
    },
    {
        path: '/carts',
        component: AppLayout,
        children: [
            {
                path: '/carts',
                name: 'Carts',
                meta: { breadcrumb: ['Carts'] },
                component: () =>
                    import('@/modules/policies/views/carts/index.vue')
            }
        ]
    }
];
