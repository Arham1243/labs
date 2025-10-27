import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchableFieldDialog from '@/modules/claims/components/shared/SearchableFieldDialog.vue';

describe('SearchableFieldDialog', async () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(SearchableFieldDialog, {
            props: {
                searchableType: 'claims'
            },
            global: {
                stubs: {
                    teleport: true
                }
            }
        });

        // Set visible to true to open the dialog
        wrapper.vm.visible = true;
    });

    // Check if the component is rendered correctly
    it('component renders correctly', () => {
        expect(wrapper.findByTestId('searchable_field_title').text()).toBe(
            'You can search by:'
        );

        expect(wrapper.findByTestId('searchable_field_0').text()).toBe(
            'Claim Received Date,'
        );
        expect(wrapper.findByTestId('searchable_field_1').text()).toBe(
            'Claim Reference Number,'
        );
        expect(wrapper.findByTestId('searchable_field_2').text()).toBe(
            'Claim Status'
        );
    });
});
