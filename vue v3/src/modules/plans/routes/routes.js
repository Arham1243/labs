import AppLayout from '@/layout/AppLayout.vue';

export default [
    {
        path: '/services',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Services',
                meta: {
                    breadcrumb: ['Services'],
                    permission: [
                        'view service code sets',
                        'view service code groups'
                    ],
                    hasTabs: true
                },
                component: () =>
                    import('@/modules/plans/views/services/index.vue'),
                children: [
                    {
                        path: '',
                        name: 'Code Sets',
                        meta: {
                            breadcrumb: ['Code Sets'],
                            permission: 'view service code sets'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-sets.vue'
                            )
                    },
                    {
                        path: 'code-groups',
                        name: 'Code Groups',
                        meta: {
                            breadcrumb: ['Code Groups'],
                            permission: 'view service code groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-groups.vue'
                            )
                    }
                ]
            },
            {
                path: 'code-set/:id',
                name: 'Code Set Details',
                props: true,
                meta: {
                    breadcrumb: ['Code Sets', 'Code Set Details'],
                    permission: 'view service code sets'
                },
                component: () =>
                    import('@/modules/plans/views/services/code-set/index.vue')
            },
            {
                path: 'code-set',
                name: 'New Code Set Stepper',
                meta: {
                    breadcrumb: ['Code Sets', 'New Code Set'],
                    permission: 'create service code sets'
                },
                component: () =>
                    import(
                        '@/modules/plans/views/services/code-set/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id/details',
                        name: 'New Code Set',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Sets', 'New Code Set'],
                            permission: 'create service code sets'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-set/new/details.vue'
                            )
                    },
                    {
                        path: ':id/add-codes',
                        name: 'New Code Set Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Sets', 'New Code Set'],
                            permission: 'create service code sets'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-set/new/add-codes.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Code Set Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Sets', 'New Code Set'],
                            permission: 'create service code sets'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-set/new/review.vue'
                            )
                    }
                ]
            },
            {
                path: 'code-group/:id',
                name: 'Code Group Details',
                props: true,
                meta: {
                    breadcrumb: ['Code Groups', 'Code Group Details'],
                    permission: 'view service code groups'
                },
                component: () =>
                    import(
                        '@/modules/plans/views/services/code-group/index.vue'
                    )
            },
            {
                path: 'code-group',
                name: 'New Code Group Stepper',
                meta: {
                    breadcrumb: ['Code Groups', 'New Code Group'],
                    permission: 'create service code groups'
                },
                component: () =>
                    import(
                        '@/modules/plans/views/services/code-group/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id/details',
                        name: 'New Code Group',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Groups', 'New Code Group'],
                            permission: 'create service code groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-group/new/details.vue'
                            )
                    },
                    {
                        path: ':id/add-codes',
                        name: 'New Code Group Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Groups', 'New Code Group'],
                            permission: 'create service code groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-group/new/add-codes.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Code Group Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Code Groups', 'New Code Group'],
                            permission: 'create service code groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/services/code-group/new/review.vue'
                            )
                    }
                ]
            }
        ]
    },
    {
        path: '/benefits',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: '',
                meta: {
                    breadcrumb: ['Benefits'],
                    permission: ['view benefits', 'view benefit categories'],
                    hasTabs: true
                },
                component: () =>
                    import('@/modules/plans/views/benefits/index.vue'),
                children: [
                    {
                        path: 'benefits',
                        name: 'Benefits',
                        meta: {
                            breadcrumb: ['Benefits'],
                            permission: 'view benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefits.vue'
                            )
                    },
                    {
                        path: 'benefits/categories',
                        name: 'Categories',
                        meta: {
                            breadcrumb: ['Categories'],
                            permission: 'view benefit categories'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/categories.vue'
                            )
                    }
                ]
            },
            {
                path: 'benefit/:id',
                name: 'Benefit Details',
                props: true,
                meta: {
                    breadcrumb: ['Benefits', 'Benefit Details'],
                    permission: 'view benefits'
                },
                component: () =>
                    import('@/modules/plans/views/benefits/benefit/index.vue')
            },
            {
                path: 'benefit',
                name: 'New Benefit Stepper',
                meta: {
                    breadcrumb: ['Benefits', 'New Benefit'],
                    permission: 'create benefits'
                },
                component: () =>
                    import(
                        '@/modules/plans/views/benefits/benefit/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id/details',
                        name: 'New Benefit',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefits', 'New Benefit'],
                            permission: 'create benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefit/new/details.vue'
                            )
                    },
                    {
                        path: ':id/select-services',
                        name: 'New Benefit Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefits', 'New Benefit'],
                            permission: 'create benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefit/new/select-services.vue'
                            )
                    },
                    {
                        path: ':id/pricing',
                        name: 'New Benefit Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefits', 'New Benefit'],
                            permission: 'create benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefit/new/pricing.vue'
                            )
                    },
                    {
                        path: ':id/documents',
                        name: 'New Benefit Step 4',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefits', 'New Benefit'],
                            permission: 'create benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefit/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Benefit Step 5',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefits', 'New Benefit'],
                            permission: 'create benefits'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefits/benefit/new/review.vue'
                            )
                    }
                ]
            }
        ]
    },
    {
        path: '/benefit-groups',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Benefit Groups',
                meta: {
                    breadcrumb: ['Benefit Groups'],
                    permission: 'view benefit groups'
                },
                component: () =>
                    import('@/modules/plans/views/benefit-groups/index.vue')
            },
            {
                path: ':id/details',
                name: 'Benefit Group Details',
                props: true,
                meta: {
                    breadcrumb: ['Benefit Groups', 'Benefit Group Details'],
                    permission: 'view benefit groups'
                },
                component: () =>
                    import('@/modules/plans/views/benefit-groups/details.vue')
            },
            {
                path: 'new',
                name: 'New Benefit Group Stepper',
                meta: {
                    breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                    permission: 'create benefit groups'
                },
                component: () =>
                    import(
                        '@/modules/plans/views/benefit-groups/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id',
                        name: 'New Benefit Group',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                            permission: 'create benefit groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefit-groups/new/benefit-group-details.vue'
                            )
                    },
                    {
                        path: ':id/add-benefits',
                        name: 'New Benefit Group Step 2',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                            permission: 'create benefit groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefit-groups/new/add-benefits.vue'
                            )
                    },
                    {
                        path: ':id/pricing',
                        name: 'New Benefit Group Step 3',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                            permission: 'create benefit groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefit-groups/new/pricing.vue'
                            )
                    },
                    {
                        path: ':id/documents',
                        name: 'New Benefit Group Step 4',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                            permission: 'create benefit groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefit-groups/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Benefit Group Step 5',
                        props: true,
                        meta: {
                            breadcrumb: ['Benefit Groups', 'New Benefit Group'],
                            permission: 'create benefit groups'
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/benefit-groups/new/review.vue'
                            )
                    }
                ]
            }
        ]
    },
    {
        path: '/non-insurance-products',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Non-Insurance Products',
                meta: {
                    breadcrumb: ['Non-Insurance Products']
                },
                component: () =>
                    import(
                        '@/modules/plans/views/non-insurance-product/index.vue'
                    )
            },
            {
                path: ':id/details',
                name: 'Non-Insurance Product Details',
                props: true,
                meta: {
                    breadcrumb: [
                        'Non-Insurance Products',
                        'Non-Insurance Product Details'
                    ]
                },
                component: () =>
                    import(
                        '@/modules/plans/views/non-insurance-product/details.vue'
                    )
            },
            {
                path: 'new',
                name: 'New Non-Insurance Product Stepper',
                meta: {
                    breadcrumb: [
                        'Non-Insurance Products',
                        'New Non-Insurance Product'
                    ]
                },
                component: () =>
                    import(
                        '@/modules/plans/views/non-insurance-product/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id',
                        name: 'New Non-Insurance Product',
                        props: true,
                        meta: {
                            breadcrumb: [
                                'Non-Insurance Products',
                                'New Non-Insurance Product'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/non-insurance-product/new/details.vue'
                            )
                    },
                    {
                        path: ':id/pricing',
                        name: 'New Non-Insurance Product Step 2',
                        props: true,
                        meta: {
                            breadcrumb: [
                                'Non-Insurance Products',
                                'New Non-Insurance Product'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/non-insurance-product/new/pricing.vue'
                            )
                    },
                    {
                        path: ':id/documents',
                        name: 'New Non-Insurance Product Step 3',
                        props: true,
                        meta: {
                            breadcrumb: [
                                'Non-Insurance Products',
                                'New Non-Insurance Product'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/non-insurance-product/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Non-Insurance Product Step 4',
                        props: true,
                        meta: {
                            breadcrumb: [
                                'Non-Insurance Products',
                                'New Non-Insurance Product'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/non-insurance-product/new/review.vue'
                            )
                    }
                ]
            }
        ]
    },
    {
        path: '/plans',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Plans',
                meta: {
                    breadcrumb: ['Plans']
                },
                component: () => import('@/modules/plans/views/plans/index.vue')
            },
            {
                path: ':id/details',
                name: 'Plan Details',
                props: true,
                meta: {
                    breadcrumb: ['Plans', 'Plan Details'],
                    back: true
                },
                component: () =>
                    import('@/modules/plans/views/plans/details.vue')
            },
            {
                path: 'new',
                name: 'New Plan Stepper',
                meta: {
                    breadcrumb: ['Plans', 'New Plan']
                },
                component: () =>
                    import('@/modules/plans/views/plans/new/index.vue'),
                children: [
                    {
                        path: ':id',
                        name: 'New Plan',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/plan-details.vue'
                            )
                    },
                    {
                        path: ':id/add-benefits',
                        name: 'New Plan Step 2',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/add-benefits.vue'
                            )
                    },
                    {
                        path: ':id/pricing',
                        name: 'New Plan Step 3',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/pricing.vue'
                            )
                    },
                    {
                        path: ':id/opt-out-settings',
                        name: 'New Plan Step 4 OptOut',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/opt-out-settings.vue'
                            )
                    },
                    {
                        path: ':id/documents',
                        name: 'New Plan Step 4 Documents',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/documents-with-optout',
                        name: 'New Plan Step 5 Documents',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Plan Step 5 Review',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import('@/modules/plans/views/plans/new/review.vue')
                    },
                    {
                        path: ':id/review-with-optout',
                        name: 'New Plan Step 6 Review',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import('@/modules/plans/views/plans/new/review.vue')
                    }
                ]
            }
        ]
    },
    {
        path: '/plans/:plan/associated',
        component: AppLayout,
        props: true,
        children: [
            {
                path: 'new',
                name: 'New Associated Plan Stepper',
                meta: {
                    breadcrumb: ['Plans', 'New Associated Plan']
                },
                component: () =>
                    import(
                        '@/modules/plans/views/plans/associated/new/index.vue'
                    ),
                children: [
                    {
                        path: ':id',
                        name: 'New Associated Plan',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Associated Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/details.vue'
                            )
                    },
                    {
                        path: ':id/add-benefits',
                        name: 'New Associated Plan Step 2',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/add-benefits.vue'
                            )
                    },
                    {
                        path: ':id/pricing',
                        name: 'New Associated Plan Step 3',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/pricing.vue'
                            )
                    },
                    {
                        path: ':id/dependant',
                        name: 'New Associated Plan Dependant',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/dependant.vue'
                            )
                    },
                    {
                        path: ':id/documents',
                        name: 'New Associated Plan Step 4',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/documents.vue'
                            )
                    },
                    {
                        path: ':id/review',
                        name: 'New Associated Plan Step 5',
                        props: true,
                        meta: {
                            disableLinks: true,
                            breadcrumb: [
                                'Templates',
                                'Agreement',
                                'New Default Plan'
                            ]
                        },
                        component: () =>
                            import(
                                '@/modules/plans/views/plans/associated/new/review.vue'
                            )
                    }
                ]
            },
            {
                path: ':id/details',
                name: 'Associated Plan Details',
                props: true,
                meta: {
                    breadcrumb: ['Associated Plans', 'Associated Plan Details'],
                    back: true
                },
                component: () =>
                    import('@/modules/plans/views/plans/associated/details.vue')
            }
        ]
    }
];
