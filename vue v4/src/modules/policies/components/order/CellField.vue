<script setup>
import { ref, computed, watch } from 'vue';
import moment from 'moment-timezone';
import { useI18n } from 'vue-i18n';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';
import { useToast } from 'primevue/usetoast';

import EnrollmentMessage from '@/modules/policies/components/order/EnrollmentMessage.vue';

const {
    updateRowFieldValue,
    tableRows,
    policyTypes,
    plans,
    countries,
    genders
} = useSmartTemplate();

const emit = defineEmits(['export', 'delete']);

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
    item: { type: Object, required: true },
    field: { type: Object, required: true },
    row: { type: Object, required: true }
});

const fixDialog = ref(false);
const newValue = ref('');
const applySameFix = ref(false);
const deleteRequested = ref(false);

const modifiedPlans = computed(() => {
    return [
        ...plans.value,
        {
            name: t('policies.match_columns.plan_not_exist'),
            deleteRequested: true
        }
    ];
});

const sameErrorRows = computed(() =>
    tableRows.value.filter(
        (obj) =>
            Object.keys(obj).length > 3 &&
            obj[props.field.value]?.value === props.item.value
    )
);

const formattedDateValue = computed(() => {
    if (props.field.inputType == 'date') {
        const dateParser = props.item.dateParser;
        const dateObj = dateParser ? dateParser(props.item.value) : null;
        return dateObj ? dateObj.format('DD MMM YYYY') : props.item.value;
    }
    return '';
});

const formattedPlanName = computed(() => {
    if (props.field.inputType == 'plan') {
        const value = String(props.item.value)
            .toLocaleLowerCase()
            .replace(' ', '');
        const selectedPlan = plans.value.find(
            (product) =>
                product.name.toLocaleLowerCase().replace(' ', '') == value ||
                product.description?.toLocaleLowerCase().replace(' ', '') ==
                    value
        );
        return selectedPlan
            ? selectedPlan.description || selectedPlan.name
            : props.item.value;
    }
    return '';
});

const dialogHeader = computed(() =>
    !props.item.isValid
        ? t(
              props.item.value
                  ? 'policies.match_columns.update_dialog_title'
                  : 'policies.match_columns.no_data_found_in_column',
              {
                  field: props.field.text,
                  value: props.item.value
              }
          )
        : t('policies.match_columns.edit_field', {
              field: props.field.text
          })
);

const openFixDialog = (event) => {
    fixDialog.value = true;
    if (props.field.category == 'datePicker') {
        const dateParser = props.item.dateParser;
        const dateObj = dateParser ? dateParser(props.item.value) : null;

        newValue.value = dateObj
            ? dateObj.format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD');
    } else {
        newValue.value = props.item.value;
    }
};

const saveFieldChanges = (event) => {
    const relatedRows = sameErrorRows.value;
    const valueToUpdate = newValue.value;
    const updatedField = updateRowFieldValue(
        props.row._id,
        props.item.name,
        valueToUpdate
    );

    if (updatedField == false) {
        toast.add({
            severity: 'error',
            summary: t('policies.review.error'),
            detail: t('policies.review.invalid_field_value', {
                value: props.item.name
            }),
            life: 2000
        });
        return;
    }
    if (applySameFix.value) {
        relatedRows.forEach((row) => {
            updateRowFieldValue(row._id, props.item.name, valueToUpdate);
        });
    }

    toast.add({
        severity: 'success',
        summary: t('policies.fix_format.success'),
        detail: t('policies.fix_format.changes_updated', {
            field: props.item.name
        }),
        life: 2000
    });
    closeDialog();
};

const closeDialog = (event) => {
    fixDialog.value = false;
    deleteRequested.value = false;
};

const handleChange = (items) => {
    deleteRequested.value = !!items.find((item) => item.name == newValue.value)
        ?.deleteRequested;
};

const getPlanDisplayName = (item) =>
    item ? item.description || item.name : '';

const exportApplicants = (items) => emit('export', sameErrorRows.value);

const removeApplicants = (items) => {
    emit('delete', sameErrorRows.value);
    closeDialog();
};

watch(fixDialog, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        applySameFix.value = false;
    }
});
</script>

<template>
    <div
        :class="{
            'text-error': !item.isValid
        }"
    >
        <div
            class="pr-2 flex items-center"
            @click.prevent="openFixDialog"
        >
            <div class="pr-1 whitespace-nowrap" v-if="item.value">
                <span v-if="field.inputType === 'date'">{{
                    formattedDateValue
                }}</span>
                <span v-else-if="field.inputType === 'plan'">
                    {{ formattedPlanName }}
                </span>
                <template v-else>
                    <span v-if="item.value && String(item.value).length < 20">
                        {{ item.value }}
                    </span>
                    <span v-else-if="item.value">
                        {{ String(item.value).substring(0, 20) }}...
                    </span>
                </template>
            </div>
            <div class="pr-1 w-full text-center" v-else>-</div>

            <i
                v-if="!item.isValid"
                style="color: #b30000"
                class="pi pi-exclamation-triangle"
            ></i>
        </div>

        <Dialog
            v-model:visible="fixDialog"
            modal
            :header="dialogHeader"
            :style="{ width: '40vw' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
            :closable="false"
        >
            <div>
                <InputField
                    class="w-full"
                    v-if="field.category == 'textField'"
                    variant="text"
                    v-model="newValue"
                />

                <Select
                    v-if="field.inputType == 'plan'"
                    v-model="newValue"
                    :options="modifiedPlans"
                    :optionLabel="getPlanDisplayName"
                    optionValue="name"
                    placeholder="Select"
                    class="w-full"
                    @change="handleChange(modifiedPlans)"
                />

                <Select
                    v-if="field.inputType == 'applicantType'"
                    v-model="newValue"
                    :options="policyTypes"
                    optionLabel="name"
                    optionValue="name"
                    class="w-full"
                />

                <DatePickerV2
                    v-if="field.category == 'datePicker'"
                    class="my-1 mx-0"
                    v-model="newValue"
                    data-testid="trip-start-date"
                    :error-messages="errors"
                />

                <Textarea
                    v-if="field.category == 'textarea'"
                    v-model="newValue"
                    rows="2"
                    placeholder="Address"
                    autoResize
                ></Textarea>

                <Select
                    v-if="field.inputType == 'gender'"
                    v-model="newValue"
                    :options="genders"
                    optionLabel="name"
                    optionValue="name"
                    class="w-full"
                />

                <ApiDropdown
                    v-if="field.inputType == 'country'"
                    class="w-full"
                    v-model="newValue"
                    :items="countries"
                    option-label="name"
                    option-value="name"
                />

                <div
                    class="flex items-center mt-2"
                    v-if="
                        !deleteRequested &&
                        !item.isValid &&
                        sameErrorRows.length > 1
                    "
                >
                    <Checkbox binary v-model="applySameFix" />
                    <label class="ml-2 mt-1">
                        {{
                            $t('policies.match_columns.apply_same_update', {
                                count: sameErrorRows.length
                            })
                        }}
                    </label>
                </div>

                <EnrollmentMessage
                    v-if="deleteRequested"
                    type="warning"
                    icon="mdi-account"
                    class="my-2"
                >
                    {{
                        $t(
                            'policies.match_columns.remove_applicants_by_field',
                            { field: field.text }
                        )
                    }}
                </EnrollmentMessage>
            </div>
            <div class="flex justify-end gap-2 mt-10">
                <Button
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="closeDialog"
                ></Button>

                <div v-if="deleteRequested" class="flex gap-2">
                    <Button
                        :label="
                            $t(
                                'policies.match_columns.export_applicants_button_label'
                            )
                        "
                        class="p-button-outlined"
                        @click="exportApplicants"
                    ></Button>

                    <Button
                        severity="danger"
                        type="button"
                        :label="
                            $t(
                                'policies.match_columns.remove_applicants_button_label'
                            )
                        "
                        @click="removeApplicants"
                    ></Button>
                </div>

                <Button
                    v-else
                    type="button"
                    :label="$t('buttons.save')"
                    @click="saveFieldChanges"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.text-error {
    color: #b30000;
}
.green--text {
    color: #006600;
}
</style>
