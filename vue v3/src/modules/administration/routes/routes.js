import AppLayout from '@/layout/AppLayout.vue';

export default [
    {
        path: '/administration',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Administration',
                component: () =>
                    import('@/modules/administration/views/index.vue'),
                meta: {
                    breadcrumb: ['Administration'],
                    permission: ['view administrations']
                }
            },
            {
                path: 'users',
                children: [
                    {
                        path: '',
                        name: 'Users',
                        component: () =>
                            import(
                                '@/modules/administration/views/users/index.vue'
                            ),
                        meta: { breadcrumb: ['Administration', 'Users'] }
                    },
                    {
                        path: ':id/',
                        name: 'User Details',
                        component: () =>
                            import(
                                '@/modules/administration/views/users/details/index.vue'
                            ),
                        meta: { breadcrumb: ['Administration', 'Users'] },
                        children: [
                            {
                                path: '',
                                name: 'User Teams',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/users/details/teams.vue'
                                    )
                            },
                            {
                                path: 'roles',
                                name: 'User Roles',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/users/details/roles.vue'
                                    )
                            },
                            {
                                path: 'scopes',
                                name: 'User Scopes',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/users/details/scopes.vue'
                                    ),
                                meta: {
                                    breadcrumb: ['Administration', 'Users']
                                }
                            }
                        ]
                    }
                ]
            },
            {
                path: 'roles',
                children: [
                    {
                        path: '',
                        name: 'Roles',
                        component: () =>
                            import(
                                '@/modules/administration/views/roles/index.vue'
                            ),
                        meta: { breadcrumb: ['Administration', 'Roles'] }
                    },
                    {
                        path: ':id',
                        name: 'RoleDetails',
                        component: () =>
                            import(
                                '@/modules/administration/views/roles/details/index.vue'
                            ),
                        meta: { breadcrumb: ['Administration', 'Roles'] },
                        children: [
                            {
                                path: '',
                                name: 'RolePermissions',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/roles/details/permissions.vue'
                                    )
                            },
                            {
                                path: 'users',
                                name: 'RoleUsers',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/roles/details/users.vue'
                                    )
                            },
                            {
                                path: 'teams',
                                name: 'RoleTeams',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/roles/details/teams.vue'
                                    )
                            }
                        ]
                    }
                ]
            },
            {
                path: 'teams',
                children: [
                    {
                        path: '',
                        name: 'Teams',
                        component: () =>
                            import(
                                '@/modules/administration/views/teams/index.vue'
                            ),
                        meta: { breadcrumb: ['Administration', 'Teams'] }
                    },
                    {
                        path: ':id',
                        component: () =>
                            import(
                                '@/modules/administration/views/teams/details/index.vue'
                            ),
                        children: [
                            {
                                path: '',
                                name: 'TeamUsers',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/teams/details/users.vue'
                                    ),
                                meta: {
                                    breadcrumb: ['Administration', 'Teams']
                                }
                            },
                            {
                                path: 'roles',
                                name: 'TeamRoles',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/teams/details/roles.vue'
                                    ),
                                meta: {
                                    breadcrumb: ['Administration', 'Teams']
                                }
                            },
                            {
                                path: 'scopes',
                                name: 'TeamScopes',
                                component: () =>
                                    import(
                                        '@/modules/administration/views/teams/details/scopes.vue'
                                    ),
                                meta: {
                                    breadcrumb: ['Administration', 'Teams']
                                }
                            }
                        ]
                    }
                ]
            },
            {
                path: 'languages',
                name: 'Languages',
                component: () =>
                    import(
                        '@/modules/administration/views/languages/index.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Languages'],
                    permission: ['view languages']
                }
            },
            {
                path: 'currency',
                name: 'Currency',
                component: () =>
                    import('@/modules/administration/views/currency/index.vue'),
                meta: {
                    breadcrumb: ['Administration', 'Currency'],
                    permission: ['view currencies']
                }
            },
            {
                path: 'country',
                component: () =>
                    import('@/modules/administration/views/country/index.vue'),
                children: [
                    {
                        path: '',
                        name: 'Country/Regions',
                        component: () =>
                            import(
                                '@/modules/administration/views/country/country/index.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Country/Regions'],
                            permission: ['view countries']
                        }
                    },
                    {
                        path: 'region',
                        name: 'Region',
                        component: () =>
                            import(
                                '@/modules/administration/views/country/region/index.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Region'],
                            permission: ['view regions']
                        }
                    },
                    {
                        path: 'province',
                        name: 'Province',
                        component: () =>
                            import(
                                '@/modules/administration/views/country/province/index.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Province'],
                            permission: ['view provinces']
                        }
                    }
                ]
            },
            {
                path: 'underwriters',
                name: 'Underwriters',
                component: () =>
                    import(
                        '@/modules/administration/views/underwriters/index.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Underwriters'],
                    permission: ['view underwriters']
                }
            },
            {
                path: 'payment-methods',
                name: 'Payment Methods',
                component: () =>
                    import(
                        '@/modules/administration/views/payment-methods/index.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Payment Methods'],
                    permission: ['view payment methods']
                }
            },
            {
                path: 'contact-types',
                name: 'Contact Types',
                component: () =>
                    import(
                        '@/modules/administration/views/client/contact-type.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Contact Types']
                }
            },
            {
                path: 'menu',
                name: 'Menu',
                component: () =>
                    import('@/modules/administration/views/menu/index.vue'),
                meta: {
                    breadcrumb: ['Administration', 'Menu'],
                    permission: ['view menu items']
                }
            },
            {
                path: 'client-sector',
                name: 'Client Sector',
                component: () =>
                    import(
                        '@/modules/administration/views/client/client-sector.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Client Sector']
                }
            },
            {
                path: 'scheduled-jobs',
                name: 'Scheduled Jobs',
                component: () =>
                    import(
                        '@/modules/administration/views/scheduled-jobs/index.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Scheduled Jobs'],
                    permission: ['view scheduled jobs']
                }
            },
            {
                path: 'contact-sources',
                name: 'Contact Sources',
                component: () =>
                    import(
                        '@/modules/administration/views/policy/contact-sources.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Contact Sources']
                }
            },
            {
                path: 'genders',
                name: 'Genders',
                component: () =>
                    import('@/modules/administration/views/policy/genders.vue'),
                meta: {
                    breadcrumb: ['Administration', 'Genders']
                }
            },
            {
                path: 'applicant-types',
                name: 'Applicant Types',
                component: () =>
                    import(
                        '@/modules/administration/views/policy/applicant-types.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'Applicant Types']
                }
            },
            {
                path: 'vendors',
                name: 'Vendors',
                component: () =>
                    import('@/modules/administration/views/vendor/index.vue'),
                meta: {
                    breadcrumb: ['Administration', 'Vendors'],
                    permission: ['view vendors']
                }
            },
            {
                path: 'app-center',
                name: 'App Center',
                component: () =>
                    import(
                        '@/modules/administration/views/app-center/index.vue'
                    ),
                meta: {
                    breadcrumb: ['Administration', 'App Center'],
                    permission: 'view app centers'
                }
            },
            {
                path: 'settings',
                component: () =>
                    import('@/modules/administration/views/settings/index.vue'),
                children: [
                    {
                        path: 'date-time',
                        name: 'Settings',
                        component: () =>
                            import(
                                '@/modules/administration/views/settings/date-time.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Settings'],
                            permission: 'update settings'
                        }
                    },
                    {
                        path: 'setting-currency',
                        name: 'Currency Settings',
                        component: () =>
                            import(
                                '@/modules/administration/views/settings/currency.vue'
                            ),
                        meta: {
                            disableLinks: true,
                            breadcrumb: ['Administration', 'Currency'],
                            permission: 'update settings'
                        }
                    }
                ]
            },
            {
                path: 'announcement',
                children: [
                    {
                        path: '',
                        name: 'Announcement',
                        component: () =>
                            import(
                                '@/modules/administration/views/announcements/list.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Announcement'],
                            permission: 'view announcements'
                        }
                    },
                    {
                        path: 'new',
                        name: 'New Announcement',
                        component: () =>
                            import(
                                '@/modules/administration/views/announcements/new.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Announcement'],
                            permission: 'create announcements'
                        }
                    },
                    {
                        path: ':id/edit',
                        name: 'Edit Announcement',
                        component: () =>
                            import(
                                '@/modules/administration/views/announcements/edit.vue'
                            ),
                        meta: {
                            breadcrumb: ['Administration', 'Announcement'],
                            permission: 'update announcements'
                        }
                    }
                ]
            }
        ]
    }
];
