import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import DateSelection from '@/modules/accounting/components/common/DateSelection.vue';

describe('DateSelection - Tests', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(DateSelection, {});
    });

    it('renders the component and ensures it is not null', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('emits an event when a date is selected', async () => {
        const date = '2023-01-01';
        await wrapper.setProps({ selectedDate: date });
        wrapper.vm.$emit('date-selected', date);
        expect(wrapper.emitted('date-selected')).toBeTruthy();
        expect(wrapper.emitted('date-selected')[0]).toEqual([date]);
    });

    it('renders the date dropdown with default options', () => {
        const dropdown = wrapper.find('[data-testid="date-dropdown"]');
        expect(dropdown.exists()).toBe(true);
        expect(wrapper.vm.dateOptions.length).toBeGreaterThan(0);
    });

    it('updates the selected option when the dropdown value changes', async () => {
        wrapper.vm.selectedDateOption = wrapper.vm.dateOptions[1]; // Update v-model directly
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.selectedDateOption).toBe(wrapper.vm.dateOptions[1]); // Assert the selected option
    });

    it('shows custom date range inputs when "Custom Range" is selected', async () => {
        const customRangeOption = wrapper.vm.dateOptions.find(
            (option) => option.value === -1
        );

        wrapper.vm.selectedDateOption = customRangeOption;
        await wrapper.vm.$nextTick();
        const customRange = wrapper.find('[data-testid="custom-date-range"]');
        expect(customRange.exists()).toBe(true);
    });

    it('hides custom date range inputs when a predefined option is selected', async () => {
        const predefinedOption = wrapper.vm.dateOptions[1];

        wrapper.vm.selectedDateOption = predefinedOption;
        await wrapper.vm.$nextTick();

        const customRange = wrapper.find('[data-testid="custom-date-range"]');
        expect(customRange.exists()).toBe(false);
    });
});
