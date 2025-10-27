import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/payment-methods/index.vue';
import { searchPaymentMethodsMock } from '@/modules/administration/tests/mocks/PaymentMethods.service.mocks';
import { getAppsByCategoryMock } from '@/../tests/mocks/Common.service.mocks';

describe('Payment Methods index view', () => {
    beforeEach(() => {
        searchPaymentMethodsMock();
        getAppsByCategoryMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Payment Methods' });

        expect(route.path).toBe('/administration/payment-methods');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe(
            'Payment Methods'
        );
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    PaymentMethodsTable: true
                }
            }
        });

        expect(wrapper.find('payment-methods-table-stub').exists()).toBe(true);
    });
});
