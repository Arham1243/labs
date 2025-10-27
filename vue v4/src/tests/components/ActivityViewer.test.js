import { describe, beforeEach, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityViewer from '@/components/ActivityViewer.vue';
import ActivityHeader from '@/components/activities/ActivityHeader.vue';
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue';
import ActivityColumnView from '@/components/activities/ActivityColumnView.vue';
import { userMock } from '@/modules/claims/tests/mocks/User.mock';

describe('ActivityViewer', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ActivityViewer, {
            props: {
                clientId: '123'
            },
            global: {
                stubs: {
                    ActivityFilterBar: true, // We can stub this if not directly testing it
                    ActivityHeader,
                    ActivityColumnView
                },
                provide: {
                    currentUser: userMock
                }
            }
        });
    });

    it('renders ActivityHeader and passes clientId', () => {
        const header = wrapper.findComponent(ActivityHeader);
        expect(header.exists()).toBe(true);
        expect(header.props('clientId')).toBe('123');
    });

    it('renders ActivityFilterBar', () => {
        const filterBar = wrapper.findComponent(ActivityFilterBar);
        expect(filterBar.exists()).toBe(true);
    });

    it('shows ActivityColumnView by default (activeTab = "All")', () => {
        const columnView = wrapper.findComponent(ActivityColumnView);
        expect(columnView.exists()).toBe(true);
    });

    it('shows column view again when activeTab is "Notes"', async () => {
        const header = wrapper.findComponent(ActivityHeader);
        await header.vm.$emit('active-tab', 'Notes');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent(ActivityColumnView).exists()).toBe(true);
    });
});
