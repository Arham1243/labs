<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import useEventsBus from '@/composables/event-bus';
import { usePlanStore } from '@/modules/plans/stores/Plan';

import PolicyDefaultForm from '@/modules/plans/components/plans/forms/PolicyDefaultForm.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
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

const { t } = useI18n();
const planStore = usePlanStore();
const { emit } = useEventsBus();
const route = useRoute();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const busy = ref(false);
const item = ref(props.data);
const itemToUpdate = ref({});

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
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
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const formatTypeName = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formattedPolicyNumber = computed(() => {
    if (!item.value?.policy_number_format?.length) return null;

    const result = item.value.policy_number_format
        .map((part) => {
            if (part.value !== null) return part.value;
            if (part.type === 'separator') return '-';
            return formatTypeName(part.type);
        })
        .join(', ');

    return result || null;
});

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
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
    try {
        busy.value = true;
        await planStore.updatePlan(
            itemToUpdate.value.id,
            planStore.transferPayload(itemToUpdate.value)
        );
        isEditing.value = false;
        clearActiveComponent();
        if (route.name === 'Plan Details') {
            emit('reloadPlanDetails');
        } else {
            emit('reloadReviewPlanDetails');
        }
    } catch (error) {
        //
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">{{ $t('plans.policy_defaults') }}</h5>
        <div v-if="isEditing">
            <Button
                :label="$t('buttons.cancel')"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.save')"
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
            :label="$t('buttons.edit')"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>
    <PolicyDefaultForm v-if="isEditing" :isNew="isNew" v-model="itemToUpdate" />
    <div v-else class="grid mt-1">
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.main_applicant_minimum_age') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1 p-break-word">
            {{ item.minimum_age }}
            {{
                item.minimum_age_type
                    ? item.minimum_age_type.name + ' ' + $t('common.old')
                    : t('common.N/A')
            }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.main_applicant_maximum_age') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1 p-break-word">
            {{ item.maximum_age }}
            {{
                item.maximum_age_type
                    ? item.maximum_age_type.name + ' ' + $t('common.old')
                    : $t('common.N/A')
            }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.enrolment_period') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">
            {{ item.enrolment_period }}
            {{ item.enrolment_period_type?.name || $t('common.N/A') }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.policy_term') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">
            {{ item.policy_term }}
            {{ item.policy_term_type?.name || t('common.N/A') }}
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.custom_policy_format') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">
            <template v-if="formattedPolicyNumber">
                {{ formattedPolicyNumber }}
            </template>
            <template v-else> <i class="pi pi-times"></i> No </template>
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.student_required') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">
            <template v-if="item.is_required_student_number"
                ><i class="pi pi-check"></i> {{ $t('common.yes') }}</template
            >
            <template v-else
                ><i class="pi pi-times"></i> {{ $t('common.no') }}</template
            >
        </div>
        <div class="sm:col-6 md:col-4 text-sm font-semibold py-1">
            {{ $t('plans.employee_required') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1">
            <template v-if="item.is_required_employee_number"
                ><i class="pi pi-check"></i> {{ $t('common.yes') }}</template
            >
            <template v-else
                ><i class="pi pi-times"></i> {{ $t('common.no') }}</template
            >
        </div>
    </div>
</template>
