import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DateTimeSettingsForm from '@/modules/administration/components/settings/DateTimeSettingsForm.vue';
import { getSettingsMock } from '@/modules/administration/tests/mocks/Setting.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('DateTimeSettingsForm', () => {
    beforeEach(() => {
        getSettingsMock();
    });

    it('renders the form with correct elements', async () => {
        updateAbility(['update settings']);
        const wrapper = mount(DateTimeSettingsForm);
        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('short-date-label').exists()).toBe(true);
        expect(wrapper.findByTestId('short-date-label').text()).toBe(
            'Short Date'
        );
        expect(wrapper.findByTestId('short-date-input').exists()).toBe(true);

        expect(wrapper.findByTestId('long-date-label').exists()).toBe(true);
        expect(wrapper.findByTestId('long-date-label').text()).toBe(
            'Long Date'
        );
        expect(wrapper.findByTestId('long-date-input').exists()).toBe(true);

        expect(wrapper.findByTestId('short-time-label').exists()).toBe(true);
        expect(wrapper.findByTestId('short-time-label').text()).toBe(
            'Short Time'
        );
        expect(wrapper.findByTestId('short-time-input').exists()).toBe(true);

        expect(wrapper.findByTestId('long-time-label').exists()).toBe(true);
        expect(wrapper.findByTestId('long-time-label').text()).toBe(
            'Long Time'
        );
        expect(wrapper.findByTestId('long-time-input').exists()).toBe(true);

        expect(wrapper.findByTestId('first-day-of-week-label').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('first-day-of-week-label').text()).toBe(
            'First day of week'
        );
        expect(wrapper.findByTestId('first-day-of-week-input').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('example-name').exists()).toBe(true);
        expect(wrapper.findByTestId('example-name').text()).toBe('Examples');

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-button').text()).toBe('Save');
    });
});
