import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SkeletonIndexView from '@/modules/skeleton/views/skeleteon/index.vue';
import SkeletonIndex from '@/modules/skeleton/components/SkeletonIndex.vue';

// Mock the SkeletonIndex component
vi.mock('@/modules/skeleton/components/SkeletonIndex.vue', () => ({
    default: {
        name: 'SkeletonIndex',
        render: () => {}
    }
}));

describe('SkeletonIndexView', () => {
    it('renders the SkeletonIndex component', () => {
        const wrapper = mount(SkeletonIndexView);

        expect(wrapper.findComponent(SkeletonIndex).exists()).toBe(true);
    });
});
