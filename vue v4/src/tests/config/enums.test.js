import { describe, expect, it } from 'vitest';
import * as enums from '@/config/enums';

describe('Enums Configuration', () => {
    it('exports ruleTimeline with the correct structure', () => {
        expect(enums.ruleTimeline).toBeDefined();
        expect(Array.isArray(enums.ruleTimeline)).toBe(true);
        expect(enums.ruleTimeline.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.ruleTimeline[0];
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('code');
        expect(typeof firstItem.name).toBe('string');
        expect(typeof firstItem.code).toBe('string');
    });

    it('exports ruleSupply with the correct structure', () => {
        expect(enums.ruleSupply).toBeDefined();
        expect(Array.isArray(enums.ruleSupply)).toBe(true);
        expect(enums.ruleSupply.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.ruleSupply[0];
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('code');
        expect(typeof firstItem.name).toBe('string');
        expect(typeof firstItem.code).toBe('string');
    });

    it('exports minDurations with the correct structure', () => {
        expect(enums.minDurations).toBeDefined();
        expect(Array.isArray(enums.minDurations)).toBe(true);
        expect(enums.minDurations.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.minDurations[0];
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('code');
        expect(typeof firstItem.name).toBe('string');
        expect(typeof firstItem.code).toBe('string');
    });

    it('exports minRequirements with the correct structure', () => {
        expect(enums.minRequirements).toBeDefined();
        expect(Array.isArray(enums.minRequirements)).toBe(true);
        expect(enums.minRequirements.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.minRequirements[0];
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('code');
        expect(typeof firstItem.name).toBe('string');
        expect(typeof firstItem.code).toBe('string');
    });

    it('exports joinTypes with the correct structure', () => {
        expect(enums.joinTypes).toBeDefined();
        expect(Array.isArray(enums.joinTypes)).toBe(true);
        expect(enums.joinTypes.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.joinTypes[0];
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('code');
        expect(typeof firstItem.name).toBe('string');
        expect(typeof firstItem.code).toBe('string');
    });

    it('exports genders with the correct structure', () => {
        expect(enums.genders).toBeDefined();
        expect(Array.isArray(enums.genders)).toBe(true);
        expect(enums.genders.length).toBeGreaterThan(0);

        // Check structure of first item
        const firstItem = enums.genders[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('name');
        expect(typeof firstItem.id).toBe('string');
        expect(typeof firstItem.name).toBe('string');
    });

    it('exports orderStatus as an object with string values', () => {
        expect(enums.orderStatus).toBeDefined();
        expect(typeof enums.orderStatus).toBe('object');
        expect(enums.orderStatus.DRAFT).toBe('draft');
        expect(enums.orderStatus.PENDING).toBe('pending');
        expect(enums.orderStatus.CONFIRMED).toBe('confirmed');
    });

    it('exports unitTermsMapper as an object with string values', () => {
        expect(enums.unitTermsMapper).toBeDefined();
        expect(typeof enums.unitTermsMapper).toBe('object');
        expect(enums.unitTermsMapper.daily).toBe('days');
        expect(enums.unitTermsMapper.monthly).toBe('months');
        expect(enums.unitTermsMapper.yearly).toBe('months');
    });

    it('exports InsuredDependentRelations as an object with string values', () => {
        expect(enums.InsuredDependentRelations).toBeDefined();
        expect(typeof enums.InsuredDependentRelations).toBe('object');
        expect(enums.InsuredDependentRelations.PARENT).toBe('parent');
        expect(enums.InsuredDependentRelations.SIBLING).toBe('sibling');
        expect(enums.InsuredDependentRelations.SPOUSE).toBe('spouse');
        expect(enums.InsuredDependentRelations.CHILD).toBe('child');
    });

    it('exports planCategories as an object with string values', () => {
        expect(enums.planCategories).toBeDefined();
        expect(typeof enums.planCategories).toBe('object');
        expect(enums.planCategories.early_arrivals).toBe('Early Arrivals');
        expect(enums.planCategories.gap).toBe('Gap');
        expect(enums.planCategories.dependants).toBe('Dependants');
        expect(enums.planCategories.recent_graduate).toBe('Recent Graduate');
    });
});
