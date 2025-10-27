import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SkeletonIndex from '@/modules/skeleton/components/SkeletonIndex.vue';
import { useSkeletonStore } from '@/modules/skeleton/stores/Skeleton';

// Create a mock for the store
const mockLogFunction = vi.fn();
const mockStore = {
    logFunction: mockLogFunction
};

// Mock the store
vi.mock('@/modules/skeleton/stores/Skeleton', () => ({
    useSkeletonStore: vi.fn(() => mockStore)
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

// Mock CSS imports
vi.mock('../assets/styles/style.css', () => ({}), { virtual: true });

describe('SkeletonIndex component', () => {
    let wrapper;

    beforeEach(async () => {
        // Clear mocks before each test
        vi.clearAllMocks();

        // Mount the component
        wrapper = mount(SkeletonIndex);

        // Wait for component to fully mount and trigger lifecycle hooks
        await flushPromises();
    });

    it('renders correctly', () => {
        expect(wrapper.find('h1').exists()).toBe(true);
        expect(wrapper.find('h1').text()).toBe('skeleton.title');
    });

    it('calls store.logFunction on mount', () => {
        expect(mockLogFunction).toHaveBeenCalled();
    });
});
