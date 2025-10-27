import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityHeader from '@/components/activities/ActivityHeader.vue';
import { nextTick } from 'vue';

vi.mock('vue-router', () => ({
    useRoute: () => ({
        query: {}
    }),
    useRouter: () => ({
        replace: vi.fn()
    })
}));

describe('ActivityHeader', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ActivityHeader, {
            props: {
                clientId: '123'
            },
            global: {
                stubs: {
                    ActivityDialog: true
                }
            }
        });
    });

    it('renders all activity tabs', () => {
        const buttons = wrapper.findAllComponents({ name: 'Button' });

        // 5 tabs + 2 buttons in New Activity menu
        expect(buttons.length).toBeGreaterThanOrEqual(5);
    });

    it('updates activeTab when a tab is clicked', async () => {
        const notesButton = wrapper
            .findAll('button')
            .find((btn) => btn.text().toLowerCase().includes('note'));

        expect(notesButton).toBeTruthy();
        await notesButton.trigger('click');
        await nextTick();

        // Check internal state
        expect(wrapper.vm.activeTab).toBe('Notes');
    });
});
