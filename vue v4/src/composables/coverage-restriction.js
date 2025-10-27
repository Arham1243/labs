import { ruleTimeline, ruleSupply } from '@/config';
import { useHelpers } from '@/composables';

export default function useCoverageRestrictionBus() {
    const helpers = useHelpers();

    function generateRuleString(arr) {
        if (!Array.isArray(arr) || arr.length == 0) {
            return 'None';
        }
        const parts = [];
        for (const element of arr) {
            const obj = element;
            parts.push(
                `${obj.value} ${helpers.getDisplayValue(
                    obj.supply,
                    ruleSupply
                )}`
            );
            parts.push(
                `every ${obj.timeline_unit} ${helpers.getDisplayValue(
                    obj.timeline,
                    ruleTimeline
                )}`
            );
            if (obj.join_type && obj.join_type !== null) {
                parts.push(`${obj.join_type}`);
            }
        }
        return parts.join(' ');
    }

    return {
        generateRuleString
    };
}
