<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useEditState } from '@/modules/plans/composables/useEditState';
import lodash from 'lodash';
import AlternateInsurance from '@/modules/plans/components/plans/AlternateInsurance.vue';
import {
    cancellationPeriodTypeOptions,
    cancellationPeriodUnitOptions,
    automaticCancellationConditions
} from '@/config';
import useEventsBus from '@/composables/event-bus.js';

const props = defineProps({
    isNew: {
        type: Boolean,
        default: false
    },
    componentId: {
        type: String,
        required: true
    },
    alternateInsuranceData: {
        type: Object,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const { formatValue, initialize } = useDateFormatter();
const route = useRoute();
const planStore = usePlanStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const { emit } = useEventsBus();
const { t } = useI18n();

const alternateInsuranceFormData = ref(props.alternateInsuranceData);
const selectAlternateInsurance = ref('alternate_insurance');
const isAlternateInsurance = computed(
    () => selectAlternateInsurance.value === 'alternate_insurance'
);

const busy = ref(false);
const isEditing = ref(false);

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
    initialize();
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(
        props.alternateInsuranceData,
        alternateInsuranceFormData.value
    );
});

const handleEdit = () => {
    alternateInsuranceFormData.value = lodash.cloneDeep(
        props.alternateInsuranceData
    );
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    busy.value = true;
    try {
        await planStore.createOrUpdateAlternateInsurance(
            alternateInsuranceFormData.value
        );
        isEditing.value = false;
        clearActiveComponent();
        if (route.name === 'Plan Details') {
            emit('reloadPlanDetails');
        } else {
            emit('reloadReviewPlanDetails');
        }
    } catch (error) {
        globalStore.showError('Error saving:', error);
    } finally {
        busy.value = false;
    }
};

const webSettingsEditOptions = [
    { name: t('plans.alternate_insurance'), value: 'alternate_insurance' },
    { name: t('plans.outside_canada'), value: 'outside_canada' }
];
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ $t('plans.opt_out_settings') }}
        </h5>
        <div v-if="isEditing">
            <Button
                label="Cancel"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                label="Save"
                :loading="busy"
                :disabled="isNotChanged"
                @click="save"
                data-testid="save-button"
            />
        </div>
        <Button
            v-else
            size="small"
            text
            class="px-2 py-1"
            label="Edit"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>

    <div v-if="isEditing">
        <AlternateInsurance v-model="alternateInsuranceFormData" />
    </div>

    <div v-else class="grid mt-1">
        <div class="col-12">
            <div class="mb-5">
                <InputField
                    variant="selectButton"
                    id="cancellation_type"
                    v-model="selectAlternateInsurance"
                    :options="webSettingsEditOptions"
                    optionValue="value"
                    optionLabel="name"
                    aria-labelledby="basic"
                />
            </div>
            <div v-if="isAlternateInsurance">
                <Divider class="font-bold">{{
                    t('plans.opt_out_form_Custom_website')
                }}</Divider>
                <div class="col-12">
                    <div
                        v-if="
                            alternateInsuranceData.fixed_window_periods &&
                            alternateInsuranceData.fixed_window_periods.length >
                                0
                        "
                    >
                        <div class="flex gap-8 col-12">
                            <span class="font-bold">Opt Out Dates</span>
                            <span>Fixed Window</span>
                        </div>
                        <DataTable
                            :value="alternateInsuranceData.fixed_window_periods"
                            responsiveLayout="scroll"
                            class="p-datatable-sm"
                        >
                            <Column
                                field="name"
                                header="Enrolment Period"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{ slotProps.data.name }}
                                </template>
                            </Column>
                            <Column
                                field="start_date"
                                header="Website Opt Out Start Date"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{
                                        slotProps.data.start_date
                                            ? formatValue(
                                                  slotProps.data.start_date,
                                                  {
                                                      type: 'date',
                                                      format: 'short'
                                                  }
                                              )
                                            : 'Not set'
                                    }}
                                </template>
                            </Column>

                            <Column
                                field="end_date"
                                header="Website Opt Out End Date"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{
                                        slotProps.data.end_date
                                            ? formatValue(
                                                  slotProps.data.end_date,
                                                  {
                                                      type: 'date',
                                                      format: 'short'
                                                  }
                                              )
                                            : 'Not set'
                                    }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div v-else class="text-center py-4">
                        <i class="pi pi-calendar text-4xl text-300 mb-3"></i>
                        <p class="text-600 m-0">No opt-out periods</p>
                    </div>
                </div>

                <Divider class="font-bold">{{
                    t('plans.opt_out_dates_between_policies')
                }}</Divider>

                <div class="col-12">
                    <div
                        v-if="
                            alternateInsuranceData.eligibility_periods &&
                            alternateInsuranceData.eligibility_periods.length >
                                0
                        "
                    >
                        <DataTable
                            :value="alternateInsuranceData.eligibility_periods"
                            responsiveLayout="scroll"
                            class="p-datatable-sm"
                        >
                            <Column
                                field="name"
                                header="Enrolment Period"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{ slotProps.data.name }}
                                </template>
                            </Column>
                            <Column
                                field="start_date"
                                header="Policies From"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{
                                        slotProps.data.start_date
                                            ? formatValue(
                                                  slotProps.data.start_date,
                                                  {
                                                      type: 'date',
                                                      format: 'short'
                                                  }
                                              )
                                            : 'Not set'
                                    }}
                                </template>
                            </Column>

                            <Column
                                field="end_date"
                                header="Policies To"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{
                                        slotProps.data.end_date
                                            ? formatValue(
                                                  slotProps.data.end_date,
                                                  {
                                                      type: 'date',
                                                      format: 'short'
                                                  }
                                              )
                                            : 'Not set'
                                    }}
                                </template>
                            </Column>

                            <Column
                                field="allow_full_cancellation"
                                header="Allow Full Cancellation"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    <span
                                        v-if="
                                            slotProps.data
                                                .allow_full_cancellation
                                        "
                                        class="flex align-items-center gap-1"
                                    >
                                        <i class="pi pi-check"></i>
                                        <span>Yes</span>
                                    </span>
                                    <span
                                        v-else
                                        class="flex align-items-center gap-1"
                                    >
                                        <i class="pi pi-times"></i>
                                        <span>No</span>
                                    </span>
                                </template>
                            </Column>

                            <Column
                                field="cancellation_period_type"
                                header="Cancellation Dates"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    {{
                                        cancellationPeriodTypeOptions.find(
                                            (i) =>
                                                i.value ===
                                                slotProps.data
                                                    .cancellation_period_type
                                        )?.name
                                    }}
                                </template>
                            </Column>

                            <Column
                                field="early_return_periods"
                                header="Cancellation Period"
                                class="bg-transparent border-0"
                            >
                                <template #body="slotProps">
                                    <template
                                        v-if="
                                            slotProps.data
                                                .cancellation_period_type ===
                                            'fixed_date'
                                        "
                                    >
                                        {{
                                            formatValue(
                                                slotProps.data
                                                    .cancellation_period_date,
                                                { type: 'date', format: 'long' }
                                            )
                                        }}
                                    </template>
                                    <template v-else>
                                        {{
                                            slotProps.data
                                                .cancellation_period_duration
                                        }}
                                        {{
                                            cancellationPeriodUnitOptions.find(
                                                (i) =>
                                                    i.value ===
                                                    slotProps.data
                                                        .cancellation_period_unit
                                            )?.name
                                        }}
                                    </template>
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div v-else class="text-center py-4">
                        <i class="pi pi-calendar text-4xl text-300 mb-3"></i>
                        <p class="text-600 m-0">No opt-out periods</p>
                    </div>
                </div>
                <Divider />
                <div class="flex">
                    <div class="col-4">
                        Allow condition for automatic cancellation
                    </div>
                    <div class="col">
                        <span
                            v-if="
                                alternateInsuranceData.allow_automatic_cancellation
                            "
                            class="flex align-items-center gap-1"
                        >
                            <span
                                >{{
                                    automaticCancellationConditions.find(
                                        (i) =>
                                            i.value ===
                                            alternateInsuranceData.automatic_cancellation_condition
                                    )?.name
                                }}
                            </span>
                            <span
                                v-if="
                                    alternateInsuranceData.automatic_cancellation_condition ===
                                    'custom_date'
                                "
                            >
                                ({{
                                    formatValue(
                                        alternateInsuranceData.automatic_cancellation_custom_date,
                                        { type: 'date', format: 'long' }
                                    )
                                }})
                            </span>
                        </span>
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
                <Divider />

                <div class="flex">
                    <div class="col-4">Requires alternate insurance info</div>
                    <div class="col">
                        <span
                            v-if="
                                alternateInsuranceData.requires_alternate_insurance_info
                            "
                            ><i class="pi pi-check"></i> <span>Yes</span></span
                        >
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
                <div
                    v-if="
                        alternateInsuranceData.requires_alternate_insurance_info
                    "
                    class="flex"
                >
                    <div class="col-4">Approved plans</div>
                    <div class="col"></div>
                </div>
                <div class="flex">
                    <div class="col-4">Allow opt out resubmissions</div>
                    <div class="col">
                        <span
                            v-if="
                                alternateInsuranceData.allow_opt_out_resubmissions
                            "
                            ><i class="pi pi-check"></i> <span>Yes</span></span
                        >
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
                <div class="flex">
                    <div class="col-4">Requires proof of coverage</div>
                    <div class="col">
                        <span
                            v-if="
                                alternateInsuranceData.requires_proof_of_coverage
                            "
                            ><i class="pi pi-check"></i> <span>Yes</span></span
                        >
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
                <div class="flex">
                    <div class="col-4">Allow direct refund</div>
                    <div class="col">
                        <span
                            v-if="
                                alternateInsuranceData.allow_direct_refund_to_student
                            "
                        >
                            <span>{{
                                alternateInsuranceData.direct_refund_options.join(
                                    ', '
                                )
                            }}</span>
                        </span>
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
                <div class="flex">
                    <div class="col-4">Allow late opt outs</div>
                    <div class="col">
                        <span v-if="alternateInsuranceData.allow_late_opt_outs">
                            {{ alternateInsuranceData.late_opt_out_duration }}
                            {{ alternateInsuranceData.late_opt_out_unit }}
                        </span>
                        <span v-else class="flex align-items-center gap-1">
                            <i class="pi pi-times"></i>
                            <span>No</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
