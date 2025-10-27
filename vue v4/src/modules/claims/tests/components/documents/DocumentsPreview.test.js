import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DocumentsPreview from '@/modules/claims/components/documents/DocumentsPreview.vue';
// import { mock_data } from '@/modules/claims/services/Claims.service';

describe('DocumentsPreview', () => {
    beforeEach(() => {});

    const testIds = [
        'img-doc-thumbnail-1',
        'text-doc-name-1',
        'btn-prev-page',
        'btn-next-page',
        'input-doc-page',
        'text-total-pages',
        'btn-zoom-out',
        'btn-zoom-in',
        'dropdown-zoom-options',
        'img-selected-doc',
        'btn-collapse-panel-side'
    ];

    const testIdValues = [
        ['text-doc-name-0', 'Claims Form'],
        ['text-total-pages', '5']
    ];
    const testInputValues = [['input-doc-page', '1']];

    const wrapper = mount(DocumentsPreview, {});

    test.each(testIds)('check if components exists - testid: %s', (test_id) => {
        expect(wrapper.findByTestId(test_id).exists()).toBe(true);
    });

    test.each(testIdValues)('check if testid: %s text is %s', (id, value) => {
        expect(wrapper.findByTestId(id).text()).toBe(value);
    });

    test.each(testInputValues)(
        'check if testid: %s value is %s',
        (id, value) => {
            expect(wrapper.findByTestId(id).find('input').element.value).toBe(
                value
            );
        }
    );

    // it('component renders correctly', async () => {
    //     const wrapper = mount(DocumentsPreview, {});
    // });
});
