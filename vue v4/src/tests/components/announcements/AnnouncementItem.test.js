import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import AnnouncementItem from '@/components/announcements/AnnouncementItem.vue';

const mountComponent = (type, message) => {
    return mount(AnnouncementItem, {
        props: {
            announcement: {
                id: 1,
                type,
                message
            }
        },
        global: {
            stubs: {
                Message: {
                    name: 'Message',
                    template: '<div><slot /></div>',
                    props: ['severity']
                }
            }
        }
    });
};

describe('AnnouncementItem', () => {
    it('renders message content as HTML', () => {
        const wrapper = mountComponent('info', '<strong>Test Message</strong>');
        const content = wrapper.find(
            '[data-testid="announcement-message-content"]'
        );

        expect(content.html()).toContain('<strong>Test Message</strong>');
    });

    it('maps type "critical" to severity "error"', () => {
        const wrapper = mountComponent('critical', 'Critical Announcement');
        const msg = wrapper.findComponent({ name: 'Message' });
        expect(msg.props('severity')).toBe('error');
    });

    it('maps type "warning" to severity "warn"', () => {
        const wrapper = mountComponent('warning', 'Warning Announcement');
        const msg = wrapper.findComponent({ name: 'Message' });
        expect(msg.props('severity')).toBe('warn');
    });

    it('passes through other types directly as severity', () => {
        const wrapper = mountComponent('success', 'Success Announcement');
        const msg = wrapper.findComponent({ name: 'Message' });
        expect(msg.props('severity')).toBe('success');
    });
});
