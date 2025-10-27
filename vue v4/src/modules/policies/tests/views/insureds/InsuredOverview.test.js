import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredOverview from '@/modules/policies/views/insureds/InsuredOverview.vue';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';

vi.mock('@/modules/policies/stores/Insureds', () => ({
    useInsuredsStore: vi.fn(() => ({
        getInsured: vi.fn().mockResolvedValue({
            data: {
                first_name: 'John',
                last_name: 'Doe'
            }
        })
    }))
}));

describe('InsuredOverview Component', () => {
    it('ensures overview tab is rendered after loading', async () => {
        const wrapper = mount(InsuredOverview, {
            global: {
                mocks: {
                    $t: (msg) => msg
                }
            },
            props: {
                id: '123'
            }
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="overview-div"]').exists()).toBe(
            true
        );
    });
});
