<script setup>
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import useEventsBus from '@/composables/event-bus';
import PlanDependantSettingsForm from '@/modules/plans/components/plans/associated/forms/PlanDependantSettingsForm.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';
import { useDateFormatter } from '@/composables/useDateFormatter.js';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    plan: {
        type: String,
        required: true
    },
    planDetails: {
        type: Object,
        required: true
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const { formatValue, initialize } = useDateFormatter();
const associatedPlanStore = useAssociatedPlanStore();
const { emit } = useEventsBus();

const isEditing = ref(false);
const busy = ref(false);
const item = ref(props.data);
const itemToUpdate = ref({});
const { t } = useI18n();

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

watch(
    () => props.data,
    (newValue) => {
        item.value = newValue;
        if (isEditing.value) {
            formatItemToUpdate();
        }
    },
    { deep: true }
);

watch(
    () => item.value,
    () => {
        if (isEditing.value) {
            formatItemToUpdate();
        }
    },
    { deep: true }
);

const handleEdit = () => {
    formatItemToUpdate();
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

const formatSettings = (settings) => ({
    ...settings,
    max_num_of_dependants: settings?.max_num_of_dependants || 0,
    apply_pricing_discount: settings?.apply_pricing_discount || 0,
    enforce_start_date: settings?.enforce_start_date || 0,
    enforce_end_date: settings?.enforce_end_date || 0
});

const formatItemToUpdate = () => {
    itemToUpdate.value = formatSettings(
        associatedPlanStore.transferDependantSettingsObject(
            item.value.dependantsSetting
        )
    );
};

const isNotChanged = computed(() => {
    const originalSettings = formatSettings(item.value.dependantsSetting);
    return lodash.isEqual(originalSettings, itemToUpdate.value);
});

const save = async () => {
    busy.value = true;
    try {
        const payload = {
            ...associatedPlanStore.transferDependantSettingsPayload(
                itemToUpdate.value
            ),
            max_num_of_dependants: Number(
                itemToUpdate.value.max_num_of_dependants
            ),
            apply_pricing_discount: Number(
                itemToUpdate.value.apply_pricing_discount
            ),
            enforce_start_date: Number(itemToUpdate.value.enforce_start_date),
            enforce_end_date: Number(itemToUpdate.value.enforce_end_date),
            pricing_discounts:
                itemToUpdate.value.pricing_discounts?.map((discount) => ({
                    percentage: Number(discount.percentage),
                    condition: discount.condition?.code || discount.condition,
                    num_of_dependants: Number(discount.num_of_dependants)
                })) || []
        };

        await associatedPlanStore.updateAssociatedPlanDependantsSettings(
            associatedPlanStore.currentPlan.id,
            payload
        );

        isEditing.value = false;
        clearActiveComponent();
        emit('reloadPlan');
    } catch (error) {
        console.error(
            'Error updating settings:',
            error?.response?.data || error
        );
    } finally {
        busy.value = false;
    }
};

const formatEnforceDates = (value) => ({
    icon: value ? 'pi pi-check' : 'pi pi-times',
    class: value ? 'text-sm' : 'text-sm',
    text: value ? 'Yes' : 'No'
});

const formatApplicants = (value, type = 'allowed') => {
    const styles = {
        allowed: {
            icon: value ? 'pi pi-check' : 'pi pi-times',
            text: value ? 'Allowed' : 'No'
        },
        yesNo: {
            icon: value ? 'pi pi-check' : 'pi pi-times',
            text: value ? 'Yes' : 'No'
        }
    };

    return styles[type];
};
</script>

<template>
    <div class="flex justify-between items-center edit-cancel-button">
        <h5 class="mb-2">
            {{ $t('dependants.dependants_settings_title') }}
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
    <PlanDependantSettingsForm
        v-if="isEditing"
        :isNew="isNew"
        :id="item.id"
        v-model="itemToUpdate"
        :periods="planDetails.periods"
    />
    <div v-else class="grid grid-cols-12">
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.max_of_dependants') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1 p-break-word">
            {{ item.dependantsSetting?.max_num_of_dependants }}
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.apply_pricing_discount') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            <i
                :class="[
                    formatEnforceDates(
                        item.dependantsSetting?.apply_pricing_discount
                    ).icon,
                    formatEnforceDates(
                        item.dependantsSetting?.apply_pricing_discount
                    ).class
                ]"
            ></i>
            <span class="ml-2">{{
                formatEnforceDates(
                    item.dependantsSetting?.apply_pricing_discount
                ).text
            }}</span>
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.enforce_start_date') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            <i
                :class="[
                    formatEnforceDates(
                        item.dependantsSetting?.enforce_start_date
                    ).icon,
                    formatEnforceDates(
                        item.dependantsSetting?.enforce_start_date
                    ).class
                ]"
            ></i>
            <span class="ml-2">{{
                formatEnforceDates(item.dependantsSetting?.enforce_start_date)
                    .text
            }}</span>
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.enforce_end_date') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            <i
                :class="[
                    formatEnforceDates(item.dependantsSetting?.enforce_end_date)
                        .icon,
                    formatEnforceDates(item.dependantsSetting?.enforce_end_date)
                        .class
                ]"
            ></i>
            <span class="ml-2">{{
                formatEnforceDates(item.dependantsSetting?.enforce_end_date)
                    .text
            }}</span>
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.restrict_eligibility_based_main_applicant_age') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            <i
                :class="[
                    formatEnforceDates(
                        item.dependantsSetting?.restrict_eligibility
                    ).icon,
                    formatEnforceDates(
                        item.dependantsSetting?.restrict_eligibility
                    ).class
                ]"
            ></i>
            <span class="ml-2">{{
                formatEnforceDates(item.dependantsSetting?.restrict_eligibility)
                    .text
            }}</span>
        </div>
        <template v-if="item.dependantsSetting?.restrict_eligibility">
            <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
                {{ $t('dependants.main_applicant_age') }}
            </div>
            <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
                <div>
                    {{ item.dependantsSetting?.main_applicant_age_condition }}
                    {{ item.dependantsSetting?.main_applicant_age }}
                    {{ item.dependantsSetting?.main_applicant_age_unit }}
                </div>
            </div>
        </template>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.minimum_dependant_age') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            {{ item.dependantsSetting?.min_dependant_age || 'N/A' }}
            {{
                item.dependantsSetting?.min_dependant_age
                    ? item.dependantsSetting?.min_dependant_age_unit
                    : ''
            }}
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.maximum_dependant_age') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            {{ item.dependantsSetting?.max_dependant_age || 'N/A' }}
            {{
                item.dependantsSetting?.max_dependant_age
                    ? item.dependantsSetting?.max_dependant_age_unit
                    : ''
            }}
        </div>
        <div class="sm:col-span-6 md:col-span-4 text-sm font-semibold py-1">
            {{ $t('dependants.time_limit_restriction_plan') }}
        </div>
        <div class="sm:col-span-6 md:col-span-8 text-sm py-1">
            <div v-if="item.dependantsSetting?.time_limit">
                <div class="mb-1">
                    Available from
                    {{ item.dependantsSetting?.available_from }}
                    {{ item.dependantsSetting?.available_from_unit }}
                    {{ item.dependantsSetting?.available_from_condition }}
                    main applicant's
                    {{
                        item.dependantsSetting?.available_from_value.replaceAll(
                            '_',
                            ' '
                        )
                    }}
                    <div v-if="props.data.effective_date">
                        ({{
                            formatValue(props.data.effective_date, {
                                type: 'date',
                                format: 'long'
                            })
                        }})
                    </div>
                </div>
                <div>
                    Available until
                    {{ item.dependantsSetting?.available_until }}
                    {{ item.dependantsSetting?.available_until_unit }}
                    {{ item.dependantsSetting?.available_until_condition }}
                    main applicant's
                    {{
                        item.dependantsSetting?.available_until_value.replaceAll(
                            '_',
                            ' '
                        )
                    }}
                    <div v-if="props.data.effective_date">
                        ({{
                            formatValue(props.data.effective_date, {
                                type: 'date',
                                format: 'long'
                            })
                        }})
                    </div>
                </div>
            </div>
            <div v-else>
                <i
                    :class="[
                        formatApplicants(false, 'yesNo').icon,
                        formatApplicants(false, 'yesNo'),
                        'mr-2'
                    ]"
                ></i>
                <span>{{ formatApplicants(false, 'yesNo').text }}</span>
            </div>
        </div>
    </div>
</template>
