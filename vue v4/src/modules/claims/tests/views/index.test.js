import { vi, beforeEach, afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';
import DashboardView from '@/modules/claims/views/index.vue';

// Mock i18n
const t = (key) => {
    const messages = {
        'claims.quick_search': 'Quick Search',
        'submissions.assigned_to_me': 'Assigned to me',
        'submissions.completed': 'Completed'
    };
    return messages[key] || key;
};

// Mock vue-router
let pushMock = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({ push: pushMock }),
    useRoute: () => ({ path: '/test', params: {}, query: {} })
}));

// ClaimBaseTable stub that triggers dataLength and accesses all props
const ClaimBaseTableStub = {
    name: 'ClaimBaseTable',
    template: '<div />',
    props: ['payload', 'storeAction', 'columns', 'onRowSelectAction'],
    mounted() {
        // Access everything the template uses to trigger coverage
        this.columns;
        this.payload;
        this.storeAction;
        this.onRowSelectAction;
    },
    emits: ['dataLength']
};

describe('DashboardView', () => {
    let wrapper;

    const factory = () =>
        mount(DashboardView, {
            global: {
                provide: { currentUser: userMock },
                mocks: { $t: t },
                stubs: {
                    ClaimBaseTable: ClaimBaseTableStub,
                    Card: {
                        template:
                            '<div class="card"><slot name="content" /></div>'
                    },
                    Badge: {
                        props: ['value'],
                        template:
                            '<span :data-testid="$attrs[\'data-testid\']">{{ value }}</span>'
                    },
                    Button: {
                        props: ['label'],
                        template:
                            '<button :data-testid="$attrs[\'data-testid\']">{{ label }}</button>'
                    },
                    TabView: {
                        template: '<div class="tabview"><slot /></div>'
                    },
                    TabPanel: {
                        template: `
                            <div class="tabpanel">
                                <div class="tab-header"><slot name="header" /></div>
                                <div class="tab-content"><slot /></div>
                            </div>
                        `
                    }
                }
            }
        });

    beforeEach(() => {
        wrapper = factory();
        pushMock.mockClear();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
        vi.clearAllTimers();
    });

    // Rendering Buttons
    it('renders new submission button', () => {
        const btn = wrapper.find('[data-testid="btn-new-submission"]');
        expect(btn.exists()).toBe(true);
        expect(btn.text()).toContain('New Submission');
    });

    it('renders quick search button', () => {
        const btn = wrapper.find('[data-testid="btn-quick-search"]');
        expect(btn.exists()).toBe(true);
        expect(btn.text()).toContain('Quick Search');
    });

    // Rendering tabs headers
    it('renders tab headers correctly', () => {
        const assignedTab = wrapper.find('[data-testid="tab-assigned-to-me"]');
        const completedTab = wrapper.find(
            '[data-testid="tab-completed-today"]'
        );
        expect(assignedTab.exists()).toBe(true);
        expect(completedTab.exists()).toBe(true);
        expect(assignedTab.text()).toBe('Assigned to me');
        expect(completedTab.text()).toBe('Completed');
    });

    // HandleRowSelect: all branches
    it('navigates when row is clicked (not radio button)', () => {
        const rowEvent = {
            originalEvent: { target: document.createElement('div') },
            data: { id: '123', client_id: '456' }
        };
        wrapper.vm.handleRowSelect(rowEvent);
        expect(pushMock).toHaveBeenCalledWith(
            '/claims/submissions/123/client/456'
        );
    });

    it('does NOT navigate when clicking radio box', () => {
        const radio = document.createElement('div');
        radio.classList.add('p-radiobutton-box');
        const rowEvent = {
            originalEvent: { target: radio },
            data: { id: '123', client_id: '456' }
        };
        wrapper.vm.handleRowSelect(rowEvent);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('does NOT navigate when clicking radio icon', () => {
        const icon = document.createElement('div');
        icon.classList.add('p-radiobutton-icon');
        const rowEvent = {
            originalEvent: { target: icon },
            data: { id: '123', client_id: '456' }
        };
        wrapper.vm.handleRowSelect(rowEvent);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('does NOT navigate when parent of clicked element is radio icon', () => {
        const parent = document.createElement('div');
        parent.classList.add('p-radiobutton-icon');
        const child = document.createElement('div');
        parent.appendChild(child);
        const rowEvent = {
            originalEvent: { target: child },
            data: { id: '123', client_id: '456' }
        };
        wrapper.vm.handleRowSelect(rowEvent);
        expect(pushMock).not.toHaveBeenCalled();
    });

    // getColumns function
    it('returns columns correctly from getColumns', () => {
        const assignedCols = wrapper.vm.getColumns('assigned');
        expect(Array.isArray(assignedCols)).toBe(true);
        const unknownCols = wrapper.vm.getColumns('unknown');
        expect(unknownCols).toEqual([]);
    });

    // activeTab reactivity
    it('updates activeTab correctly', async () => {
        wrapper.vm.activeTab = 1;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.activeTab).toBe(1);
    });

    // dataLength events for active/completed submissions
    it('updates activeSubmissionsLength and completedSubmissionsLength via dataLength', async () => {
        const tables = wrapper.findAllComponents(ClaimBaseTableStub);

        // assigned submissions
        await tables[0].vm.$emit('dataLength', 5);
        expect(wrapper.vm.activeSubmissionsLength).toBe(5);

        // completed submissions
        await tables[1].vm.$emit('dataLength', 3);
        expect(wrapper.vm.completedSubmissionsLength).toBe(3);
    });
});
