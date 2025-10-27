import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

const MockedBenefitGroupComponent = defineComponent({
    name: 'MockedBenefitGroupComponent',
    template: `
    <div>
      <h1 data-testid="page-title">Mocked Benefit Group</h1>
      <div data-testid="status-tag"></div>
      <button data-testid="actions-button">Actions</button>
      <div>
        <span data-testid="overview-header-tab" class="p-tabview-title">Overview</span>
        <span data-testid="pricing-header-tab" class="p-tabview-title">Pricing</span>
        <span data-testid="documents-header-tab" class="p-tabview-title">Documents</span>
        <span data-testid="audit-logs-header-tab" class="p-tabview-title">Audit Log</span>
      </div>
      <div>
        <div data-testid="benefit-groups-details"></div>
        <div data-testid="benefit-groups-benefits"></div>
      </div>
    </div>
  `
});

describe('Benefit groups details view', () => {
    it('page renders correctly', async () => {
        const wrapper = mount(MockedBenefitGroupComponent);

        const pageTitle = wrapper.findByTestId('page-title');
        const statusTag = wrapper.findByTestId('status-tag');
        const actionsButton = wrapper.findByTestId('actions-button');
        const overviewHeaderTab = wrapper.findByTestId('overview-header-tab');
        const pricingHeaderTab = wrapper.findByTestId('pricing-header-tab');
        const documentsHeaderTab = wrapper.findByTestId('documents-header-tab');
        const auditLogsHeaderTab = wrapper.findByTestId(
            'audit-logs-header-tab'
        );
        const benefitGroupsDetails = wrapper.findByTestId(
            'benefit-groups-details'
        );
        const benefitGroupsBenefits = wrapper.findByTestId(
            'benefit-groups-benefits'
        );

        expect(pageTitle.exists()).toBe(true);
        expect(statusTag.exists()).toBe(true);
        expect(actionsButton.exists()).toBe(true);
        expect(overviewHeaderTab.exists()).toBe(true);
        expect(pricingHeaderTab.exists()).toBe(true);
        expect(documentsHeaderTab.exists()).toBe(true);
        expect(auditLogsHeaderTab.exists()).toBe(true);
        expect(benefitGroupsDetails.exists()).toBe(true);
        expect(benefitGroupsBenefits.exists()).toBe(true);

        expect(overviewHeaderTab.text()).toBe('Overview');
        expect(pricingHeaderTab.text()).toBe('Pricing');
        expect(documentsHeaderTab.text()).toBe('Documents');
        expect(auditLogsHeaderTab.text()).toBe('Audit Log');
    });
});
