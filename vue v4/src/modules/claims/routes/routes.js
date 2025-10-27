import AppLayout from '@/layout/AppLayout.vue';
import AppLayoutFullWidth from '@/modules/claims/layout/AppLayoutFullWidth.vue';
import { cfg } from '@/modules/claims/utils/submissions';
import { cfg_adjudication } from '@/modules/claims/utils/adjudication';

const steps = cfg.claims_process.claimSteps;

export default [
    {
        path: '/claims',
        component: AppLayout,
        children: [
            {
                path: '/claims',
                name: 'Claims',
                meta: { breadcrumb: ['Claims'] },
                component: () => import('@/modules/claims/views/index.vue')
            },
            {
                path: '/claims/list',
                name: 'Claims List',
                meta: { breadcrumb: ['Claims'] },
                component: () =>
                    import('@/modules/claims/views/claims/list.vue')
            },
            {
                path: '/claims/:claimId/client/:clientId',
                name: 'Claim Details',
                meta: { breadcrumb: ['Claims', 'Claim Details'] },
                component: () => import('@/modules/claims/views/claim.vue')
            },
            {
                path: '/claims/submissions',
                name: 'Submission List',
                meta: { breadcrumb: ['Claims', 'Submission List'] },
                component: () =>
                    import('@/modules/claims/views/submissions/list.vue')
            },
            {
                path: '/claims/submissions/new/search',
                name: 'Submission Policy',
                meta: { breadcrumb: ['Claims', 'New Submission'] },
                component: () =>
                    import('@/modules/claims/views/submissions/new/search.vue')
            },
            {
                path: '/claims/submissions/new',
                name: 'New Submission',
                meta: { breadcrumb: ['Claims', 'New Submission'] },
                component: () =>
                    import('@/modules/claims/views/submissions/new/index.vue'),
                children: steps.map((step) => ({
                    path: step.path,
                    name: step.title,
                    props: true,
                    meta: {
                        breadcrumb: ['Claims', 'New Submission', step.title]
                    },
                    component: () =>
                        import(
                            `@/modules/claims/views/submissions/new/${step.path}.vue`
                        )
                }))
            },
            {
                path: '/claims/submissions/:submissionId/client/:clientId',
                name: 'Submissions',
                meta: { breadcrumb: ['Claims', 'Submissions'] },
                component: () => import('@/modules/claims/views/submission.vue')
            },
            {
                path: '/claims/adjudication',
                name: 'Submission Auto Adjudication',
                meta: {
                    breadcrumb: ['Claims', 'Submission Auto Adjudication']
                },
                component: () =>
                    import('@/modules/claims/views/adjudication/index.vue')
            },
            {
                path: '/claims/adjudication/:queueId',
                name: 'Queue Details',
                meta: {
                    breadcrumb: ['Claims', 'Submission Auto Adjudication']
                },
                component: () =>
                    import('@/modules/claims/views/adjudication/details.vue')
            },
            {
                path: '/claims/adjudication/new',
                name: 'New Queue',
                meta: {
                    breadcrumb: [
                        'Claims',
                        'Submission Auto Adjudication',
                        'New Queue'
                    ]
                },
                component: () =>
                    import('@/modules/claims/views/adjudication/new/index.vue'),
                children: cfg_adjudication.map((step) => ({
                    path: step.path,
                    name: step.title + ' ',
                    props: true,
                    meta: {
                        breadcrumb: [
                            'Claims',
                            'Submission Auto Adjudication',
                            'New Queue'
                        ]
                    },
                    component: () =>
                        import(
                            `@/modules/claims/views/adjudication/new/${step.path}.vue`
                        )
                }))
            }
        ]
    },
    {
        path: '/claims/submissions/:submissionId/expenses/:expenseId/client/:clientId',
        component: AppLayoutFullWidth,
        children: [
            {
                path: '/claims/submissions/:submissionId/expenses/:expenseId/client/:clientId',
                name: 'Expenses',
                meta: { breadcrumb: ['Claims', 'Submissions', 'Expenses'] },
                component: () => import('@/modules/claims/views/expense.vue')
            }
        ]
    }
];
