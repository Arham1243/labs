import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HoldingsTable from '@/modules/clients/components/tables/HoldingsTable.vue';
import { searchHoldingsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('HoldingsTable', () => {
    beforeEach(() => {
        searchHoldingsMock();

        updateAbility([
            'create holdings',
            'update holdings',
            'delete holdings'
        ]);
    });

    it('component renders correctly', async () => {
        const wrapper = mount(HoldingsTable, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findComponent({ name: 'Search' }).exists()).toBe(true);

        const columnTitles = wrapper.findAll('.p-column-title');

        expect(columnTitles).toHaveLength(3);
        expect(columnTitles[0].text()).toBe('Holding Name');
        expect(columnTitles[1].text()).toBe('Short Name');
        expect(columnTitles[2].text()).toBe('Status');

        expect(
            wrapper
                .find('div.p-datatable-loading-overlay.p-component-overlay')
                .text()
        ).toBe('Loading holdings. Please wait.');
        expect(wrapper.find('tr.p-datatable-emptymessage>td').text()).toBe(
            'No holdings found.'
        );

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(3);
    });
});
