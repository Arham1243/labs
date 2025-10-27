import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredSettings from '@/modules/policies/components/insureds/Settings.vue';

describe('Insured Settings', () => {
    it('renders correctly', async () => {
        const wrapper = mount(InsuredSettings);

        expect(wrapper.find('h5').text()).toBe('Insured Settings');
    });
});
