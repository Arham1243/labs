import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/benefits/benefit/new/index.vue';

describe('Services index view', () => {
    it('index renders correctly', async () => {
        vi.mock(import('vue-router'), async (importOriginal) => {
            const mod = await importOriginal();
            return {
                ...mod,
                useRoute: vi.fn().mockReturnValue({ params: { id: '-1' } })
            };
        });

        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('index-title').text()).toBe('New Benefit');

        expect(wrapper.findByTestId('back-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Stepper' }).exists()).toBe(true);
    });
});
