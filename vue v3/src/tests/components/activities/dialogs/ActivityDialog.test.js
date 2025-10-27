import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityDialog from '@/components/activities/dialogs/ActivityDialog.vue';
import { useClaimPolicyStoreMock } from '@/modules/claims/tests/mocks/Policy.service.mock.js';
import { useActivityStoreMock } from '@/tests/mocks/Activity.service.mock.js';

// Mocks
vi.mock('@/utils/activities', () => ({
    createActivitiesDialogTitle: () => ({
        note: () => ({
            title: 'Note Title',
            icon: 'pi pi-book',
            icon_color: '#000',
            icon_background: '#fff'
        })
    }),
    createActivitiesDialogContent: () => ({
        note: () => [
            {
                label: 'Title',
                props: { name: 'title' }
            },
            {
                label: 'Content',
                props: { name: 'content' }
            }
        ]
    })
}));

// Mock i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (str) => str
    })
}));

// Mock vue-router
vi.mock('vue-router', () => ({
    useRoute: () => ({
        query: {
            module: 'claims',
            moduleId: 'claim-123'
        }
    })
}));

// Mock activity store
vi.mock('@/stores/Activity', () => ({
    useActivityStore: vi.fn(() => ({
        ...useActivityStoreMock()
    }))
}));

// Stubs
const stubs = {
    Dialog: {
        template: `<div><slot name="header" /><slot /><slot name="footer" /></div>`,
        props: ['visible']
    },
    LabelField: {
        template: `<div class="label-field"><input @input="$emit('update:modelValue', $event.target.value)" /></div>`,
        props: ['field', 'modelValue']
    },
    TemplateDialog: {
        template: `<div class="template-dialog" />`
    },
    Button: {
        template: `<button @click="$emit('click')"><slot /></button>`,
        props: ['label']
    }
};

describe('ActivityDialog.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ActivityDialog, {
            props: {
                type: 'note',
                clientId: 'client-001',
                visible: true
            },
            global: {
                stubs,
                provide: {
                    currentUser: { id: 'user-001' }
                }
            }
        });
    });

    it('renders dialog with title and icon', () => {
        const html = wrapper.html();
        expect(html).toContain('Note Title');
        expect(html).toContain('pi pi-book');
    });

    it('renders form fields', () => {
        const fields = wrapper.findAll('.label-field');
        expect(fields).toHaveLength(2);
    });

    it('hides dialog on cancel click', async () => {
        const cancelBtn = wrapper.find('[data-testid="cancel-button"]');
        await cancelBtn.trigger('click');
        expect(wrapper.emitted()['update:visible'][0]).toEqual([false]);
    });
});
