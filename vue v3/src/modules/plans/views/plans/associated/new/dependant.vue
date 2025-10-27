<script setup>
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import PlanDependantSettingsForm from '@/modules/plans/components/plans/associated/forms/PlanDependantSettingsForm.vue';

const props = defineProps({
    plan: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const associatedPlanStore = useAssociatedPlanStore();
const { t } = useI18n();

const showUnsavedData = ref(false);
const loadingPlan = ref(false);
const planDetails = ref({});
const busy = ref(false);
const formData = ref({
    max_num_of_dependants: 1,
    apply_pricing_discount: false,
    enforce_start_date: false,
    enforce_end_date: false,
    pricing_discounts: [],
    restrict_eligibility: false,
    main_applicant_age_condition: { id: 'over', name: 'Over' },
    main_applicant_age: 1,
    main_applicant_age_unit: { id: 'years', name: 'Years' },
    min_dependant_age: null,
    min_dependant_age_unit: { id: 'years', name: 'Years' },
    max_dependant_age: null,
    max_dependant_age_unit: { id: 'years', name: 'Years' },
    time_limit: false,
    available_from: 1,
    available_from_unit: { id: 'days', name: 'Days' },
    available_from_condition: { id: 'after', name: 'After' },
    available_from_value: {},
    available_until: 1,
    available_until_unit: { id: 'days', name: 'Days' },
    available_until_condition: { id: 'after', name: 'After' },
    available_until_value: {}
});

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    loadingPlan.value = true;
    const res = await associatedPlanStore.getPlan(props.plan, props.id, {
        include:
            'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,dependantsSetting.dependantsSettingsPricingDiscounts,plan.periods'
    });

    planDetails.value = res.data;

    if (planDetails.value.dependantsSetting) {
        formData.value = associatedPlanStore.transferDependantSettingsObject(
            planDetails.value.dependantsSetting
        );
    }

    loadingPlan.value = false;
};

const save = async () => {
    try {
        busy.value = true;

        const res = await associatedPlanStore.updateAssociatedPlanSettings(
            planDetails.value.id,
            associatedPlanStore.transferDependantSettingsPayload(formData.value)
        );

        goNext(res);
    } finally {
        busy.value = false;
    }
};

const goNext = (res) => {
    router.push({
        name: 'New Associated Plan Step 4',
        params: { id: props.id, plan: props.plan }
    });
};

const goBack = () => {
    router.push({
        name: 'New Associated Plan Step 3',
        params: { id: props.id, plan: props.plan }
    });
};
</script>

<template>
    <Loader v-if="loadingPlan" />
    <div v-else>
        <div
            class="p-fluid d-flex flex-column mt-6 mb-8 justify-content-center align-items-center"
            style="margin-left: 11rem; margin-right: 11rem"
        >
            <Card class="mb-3">
                <template #content>
                    <div class="flex justify-content-between">
                        <h5 data-testid="dependant-title" class="mb-3">
                            {{ $t('plans.dependant_settings') }}
                        </h5>
                    </div>
                    <PlanDependantSettingsForm
                        is-new
                        v-model="formData"
                        :id="id"
                        :periods="planDetails.plan.periods"
                    />
                </template>
            </Card>
        </div>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        label="Back"
                        class="p-button-outlined"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
    </div>

    <Confirmation
        v-model="showUnsavedData"
        :header="$t('common.cancel_creation_header', { item: 'Plan' })"
        :content="$t('common.cancel_creation_content')"
        :confirm-button-text="$t('buttons.cancel')"
        :cancel-button-text="$t('buttons.close')"
        confirm-button-class="bg-red-500 border-red-500"
        @confirm="goBack"
    />
</template>
