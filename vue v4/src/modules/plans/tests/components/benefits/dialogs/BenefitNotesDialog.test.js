import { describe, expect, it, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import BenefitGroupsBenefitsTable from '@/modules/plans/components/benefit-groups/tables/BenefitGroupsBenefitsTable.vue';
import { fireEvent, render, within } from '@testing-library/vue';
import { searchBenefitGroupsBenefitsMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';
import {
    getBenefitGroupMock,
    searchBenefitGroupBenefitsMock
} from '@/modules/plans/tests/mocks/Benefit.service.mocks';

describe('BenefitNotesDialog', () => {
    beforeEach(() => {
        searchBenefitGroupsBenefitsMock();
        getBenefitGroupMock();
        searchBenefitGroupBenefitsMock();
    });

    it('renders correctly', async () => {
        const { getByTestId } = render(BenefitGroupsBenefitsTable, {
            props: {
                id: '760010800348790784'
            }
        });

        await flushPromises();

        await fireEvent.click(getByTestId('show-benefit-notes-dialog-0'));

        const dialog = within(getByTestId('benefit-notes-dialog'));

        dialog.getByText('Add atque maxime voluptatem Note');
        dialog.getByTestId('note-input');

        expect(dialog.getByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(dialog.getByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });
});
