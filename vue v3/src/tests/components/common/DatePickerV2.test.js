import { mount } from '@vue/test-utils';
import DatePickerV2 from '@/components/common/DatePickerV2.vue';

describe('DatePickerV2.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(DatePickerV2, {
            props: {
                modelValue: null
            }
        });
    });

    it('renders the date picker', () => {
        expect(wrapper.find('.p-input-icon-left').exists()).toBe(true);
        expect(wrapper.find('i.pi-calendar').exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'Calendar' }).exists()).toBe(true);
    });

    it('disables the date picker when the disabled prop is true', async () => {
        await wrapper.setProps({ disabled: true });

        const calendar = wrapper.findComponent({ name: 'Calendar' });
        expect(calendar.props('disabled')).toBe(true);
    });

    it('emits update:modelValue when a date is selected', async () => {
        const calendar = wrapper.findComponent({ name: 'Calendar' });

        await calendar.vm.$emit('update:modelValue', '2023-12-25');

        expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
        expect(wrapper.emitted()['update:modelValue'][0]).toEqual([
            '2023-12-25'
        ]);
    });

    it('displays error messages when provided', async () => {
        await wrapper.setProps({
            errorMessages: ['Invalid date', 'Date is required']
        });

        await wrapper.vm.$nextTick();

        const errors = wrapper.findAll('.p-error');
        expect(errors.length).toBe(2);
        expect(errors[0].text()).toBe('Invalid date');
        expect(errors[1].text()).toBe('Date is required');
    });

    it('updates the displayed date when modelValue changes externally', async () => {
        const wrapper = mount(DatePickerV2, {
            props: {
                modelValue: '2025-02-01'
            }
        });

        const input = wrapper.find('input');
        expect(input.element.value).toBe('01-Feb-2025');

        await wrapper.setProps({ modelValue: '2025-02-15' });

        expect(input.element.value).toBe('15-Feb-2025');
    });
});
