<script setup>
import { ref } from 'vue';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

import PlanDetails from '@/modules/policies/components/order/PlanDetails.vue';

const helpers = useHelpers();
const { t } = useI18n();

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
});

const planCategories = ref({
    early_arrivals: t('common.early_arrivals'),
    gap: t('common.gap'),
    dependants: t('common.dependants'),
    recent_graduate: t('common.recent_graduate')
});
</script>

<template>
    <div v-for="(plan, planIndex) in items" :key="`plan-list-${planIndex}`">
        <Accordion
            v-if="plan.associated_plans.length"
            class="plan-accordion"
            multiple
            expandIcon="pi pi-chevron-right font-semibold"
            collapseIcon="pi pi-chevron-down font-semibold"
        >
            <AccordionTab>
                <template #header>
                    <div class="text-sm">
                        <div class="font-semibold">
                            {{ helpers.getLocaleValue(plan.name) }}
                        </div>
                        <div class="mt-2">
                            <PlanDetails :plan="plan" />
                        </div>
                    </div>
                </template>
                <div
                    v-for="(
                        associatedPlan, associatedPlanIndex
                    ) in plan.associated_plans"
                    :key="`associated-plan-${associatedPlanIndex}`"
                    class="associated-plan-container text-sm mt-20"
                >
                    <Divider />
                    <div class="font-semibold">
                        {{ planCategories[associatedPlan.category] }}
                    </div>
                    <div class="mt-2">
                        <PlanDetails :plan="associatedPlan" associated />
                    </div>
                </div>
            </AccordionTab>
        </Accordion>
        <div class="text-sm single-plan" v-else>
            <div class="font-semibold">
                {{ helpers.getLocaleValue(plan.name) }}
            </div>
            <div class="mt-2">
                <PlanDetails :plan="plan" />
            </div>
        </div>
        <div class="plan-divider">
            <Divider v-if="planIndex != items.length - 1" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.plan-accordion) {
    a.p-accordion-header-link {
        border: none;
        background: none !important;
        font-weight: unset;
        color: unset;
        align-items: flex-start;
        box-shadow: none !important;
        padding-bottom: 0;
        padding-top: 0;

        .p-accordion-toggle-icon {
            font-size: 0.875rem;
            margin-top: 0.2rem;

            &::before {
                font-weight: normal;
            }
        }
    }

    .p-accordionpanel {
        border: none;
    }

    .p-accordion-content {
        border: none;
        padding-bottom: 0;
        padding-top: 0;
    }

    .associated-plan-container {
        margin-left: 1.4rem;
    }
}

.single-plan {
    padding: var(--p-accordion-header-padding);
}

.plan-divider {
    margin-left: 1.25rem;
    margin-right: 1.25rem;
}

.mt-20 {
    margin-top: 1.25rem;
}
</style>
