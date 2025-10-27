import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailsViewHeaderActions from '@/modules/claims/components/shared/details/DetailsViewHeaderActions.vue';

describe('DetailsViewHeaderActions', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(DetailsViewHeaderActions, {
            props: {
                moduleType: 'submission'
            }
        });

        expect(
            wrapper.findByTestId('btn-open-submission-actions-menu').exists()
        ).toBe(true);

        expect(
            wrapper.findByTestId('btn-complete-submission-action').exists()
        ).toBe(true);
    });
});
