import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FormView from '@/modules/administration/components/announcements/AnnouncementForm.vue';
import { updateAbility } from '@/plugins/ability';

describe('AnnouncementForm', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(FormView, {
            props: {
                mode: 'new'
            }
        });
    });

    it('renders all form labels, inputs, and action buttons', async () => {
        updateAbility(['create announcements']);
        await wrapper.vm.$nextTick();

        // Labels
        const startLabel = wrapper.findByTestId('start-date-time-label');
        expect(startLabel.exists()).toBe(true);
        expect(startLabel.text()).toBe('Start Date/Time');

        const endLabel = wrapper.findByTestId('end-date-time-label');
        expect(endLabel.exists()).toBe(true);
        expect(endLabel.text()).toBe('End Date/Time');

        const portalLabel = wrapper.findByTestId('portal-label');
        expect(portalLabel.exists()).toBe(true);
        expect(portalLabel.text()).toBe('Portal');

        const typeLabel = wrapper.findByTestId('type-label');
        expect(typeLabel.exists()).toBe(true);
        expect(typeLabel.text()).toBe('Announcement Type');

        const messageLabel = wrapper.findByTestId('announcement-message-label');
        expect(messageLabel.exists()).toBe(true);
        expect(messageLabel.text()).toBe('Message');

        // Inputs
        expect(wrapper.findByTestId('start-date-time-input').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('end-date-time-input').exists()).toBe(true);
        expect(wrapper.findByTestId('portal-input').exists()).toBe(true);
        expect(wrapper.findByTestId('announcement-type-input').exists()).toBe(
            true
        );
        expect(
            wrapper.findByTestId('announcement-message-editor').exists()
        ).toBe(true);

        // Buttons
        const cancelBtn = wrapper.findByTestId('cancel-button');
        expect(cancelBtn.exists()).toBe(true);
        expect(cancelBtn.text()).toBe('Cancel');

        const saveBtn = wrapper.findByTestId('save-button');
        expect(saveBtn.exists()).toBe(true);
        expect(saveBtn.text()).toBe('Save');
    });
});
