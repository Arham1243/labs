import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientsTable from '@/modules/clients/components/tables/ClientsTable.vue';
import { searchClientsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('ClientsTable', () => {
    beforeEach(() => {
        searchClientsMock();

        updateAbility(['create clients', 'update clients', 'delete clients']);
    });

    it('component renders correctly', async () => {
        const wrapper = mount(ClientsTable, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findComponent({ name: 'Search' }).exists()).toBe(true);

        const columnTitles = wrapper.findAll('th');

        expect(columnTitles).toHaveLength(4);
        expect(columnTitles[0].text()).toBe('Client Name');
        expect(columnTitles[1].text()).toBe('Short Name');
        expect(columnTitles[2].text()).toBe('Status');

        expect(
            wrapper
                .find('div.p-datatable-mask.p-overlay-mask')
                .text()
        ).toBe('Loading clients. Please wait.');
        expect(wrapper.find('.p-datatable-empty-message').text()).toBe(
            'No clients found.'
        );

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(3);
    });
});
