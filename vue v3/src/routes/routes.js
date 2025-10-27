import AppLayout from '@/layout/AppLayout.vue';
import AuthLayout from '@/layout/AuthLayout.vue';

const modules = import.meta.glob('@/modules/*/index.js', { eager: true });
const items = [];
Object.keys(modules).forEach((path) => {
    let module = modules[path];
    module = module.default;
    module.routes.map((routes) => {
        items.push(routes);
    });
});

export default [
    {
        path: '/',
        name: 'Home',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: 'Dashboard',
                meta: { breadcrumb: ['Dashboard'] },
                component: () => import('@/template/dashboards/Ecommerce.vue')
            }
        ]
    },
    {
        path: '/payments',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Payments',
                meta: {
                    breadcrumb: ['Payments']
                },
                component: () => import('@/template/dashboards/Payment.vue')
            },
            {
                path: '/payments/:appId/success',
                name: 'PaymentSuccess',
                meta: {
                    breadcrumb: ['Payments', 'Success']
                },
                component: () => import('@/template/dashboards/Success.vue')
            },
            {
                path: '/payments/:appId/cancel',
                name: 'PaymentCancel',
                meta: {
                    breadcrumb: []
                },
                component: () => import('@/template/dashboards/Cancel.vue')
            }
        ]
    },
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/views/auth/Login.vue')
            },
            {
                path: 'verify/email',
                name: 'Verify Email Code',
                component: () => import('@/views/auth/VerifyEmailCode.vue')
            },
            {
                path: 'verify/sms',
                name: 'Verify SMS Code',
                component: () => import('@/views/auth/VerifySmsCode.vue')
            },
            {
                path: 'password/set',
                name: 'Password Setup',
                component: () => import('@/views/auth/PasswordSetup.vue')
            },
            {
                path: 'password/forget',
                name: 'Password Reset Request',
                component: () => import('@/views/auth/PasswordResetRequest.vue')
            },
            {
                path: 'password/reset',
                name: 'New Password Setup',
                component: () => import('@/views/auth/PasswordResetForm.vue')
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/errors/NotFound.vue')
    },
    ...items
];
