<script setup>
import { watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    planCategory: {
        type: String
    },
    periods: {
        type: Array,
        default: () => []
    }
});
const helpers = useHelpers();

const emit = defineEmits(['update:modelValue', 'save']);

const { t } = useI18n();

const formData = ref(props.modelValue);
const periodDateReferenceOptions = ref([]);
const precedenceDropDownOptions = [
    {
        name: t('common.precedence_after'),
        value: 'after'
    },
    {
        name: t(`common.precedence_before`),
        value: 'before'
    }
];

watch(
    formData,
    (value) => {
        emit('update:modelValue', value);
        updatePeriodDateRefereneOptions();
    },
    { deep: true }
);

watch(
    () => formData.value[props.planCategory + '_periods'],
    () => updatePeriodDateRefereneOptions(),
    { deep: true }
);

const addNewPeriod = () => {
    const newPeriod = {
        plan_period_id: null,
        days: null,
        plan_period_precedence: 'after',
        plan_period_date_reference: null
    };

    formData.value[props.planCategory + '_periods'].push(newPeriod);
    updatePeriodDateRefereneOptions();
};

const remove = (date) => {
    formData.value[props.planCategory + '_periods'].splice(
        formData.value[props.planCategory + '_periods'].indexOf(date),
        1
    );
};

const getPeriodDateValue = (date, periodId) => {
    const period = props.periods.find((item) => item.id === periodId);
    const text = `${t(`common.${date}`)}${
        period ? `(${helpers.formatDate(period[date], 'D MMM')})` : ''
    }`;
    return text;
};

const updatePeriodDateRefereneOptions = () => {
    periodDateReferenceOptions.value = formData.value[
        props.planCategory + '_periods'
    ].map((period) => {
        const selectedPeriod = props.periods.find(
            (item) => item.id === period.plan_period_id?.id
        );
        if (selectedPeriod) {
            return [
                {
                    name: `${t('common.start_date')} (${helpers.formatDate(
                        selectedPeriod.start_date,
                        'D MMM'
                    )})`,
                    value: 'start_date'
                },
                {
                    name: `${t('common.end_date')} (${helpers.formatDate(
                        selectedPeriod.end_date,
                        'D MMM'
                    )})`,
                    value: 'end_date'
                }
            ];
        }
        return [];
    });
};

updatePeriodDateRefereneOptions();
</script>
<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12 mb-4">
            <div class="flex gap-3">
                <div>
                    <InputField
                        id="open"
                        name="date_type"
                        value="open"
                        variant="radio"
                        v-model="formData[planCategory + '_type']"
                        data-testid="date-type-open"
                    />
                    <label for="open" class="ml-2 mr-4 mt-1">{{
                        $t('plans.open_dates')
                    }}</label>
                    <i
                        v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                        class="pi pi-info-circle"
                    ></i>
                </div>
                <div>
                    <InputField
                        id="fixed"
                        name="date_type"
                        value="fixed"
                        variant="radio"
                        v-model="formData[planCategory + '_type']"
                        data-testid="date-type-fixed"
                    />
                    <label for="fixed" class="ml-2 mr-4 mt-1">{{
                        $t('plans.fixed_dates')
                    }}</label>
                    <i
                        v-tooltip="`lorem ipsum lorem ipsum lorem ipsum`"
                        class="pi pi-info-circle"
                    ></i>
                </div>
            </div>
        </div>
        <div
            v-if="formData[planCategory + '_type'] === 'open'"
            class="field col-6"
        >
            <label :for="props.planCategory + '_min_days'"
                >{{ $t('common.min') }} # {{ $t('common.of_days') }} *</label
            >
            <InputField
                :id="props.planCategory + '_min_days'"
                variant="number"
                :addon-after="$t('common.days')"
                :min="0"
                v-model="formData[planCategory + '_min_days']"
                :data-testid="planCategory + '_min_days'"
            />
        </div>
        <div
            v-if="formData[planCategory + '_type'] === 'open'"
            class="field col-6"
        >
            <label :for="props.planCategory + '_max_days'"
                >{{ $t('common.max') }} # {{ $t('common.of_days') }} *</label
            >
            <InputField
                :id="props.planCategory + '_max_days'"
                variant="number"
                :addon-after="$t('common.days')"
                :min="0"
                v-model="formData[planCategory + '_max_days']"
                :data-testid="planCategory + '_max_days'"
            />
        </div>
        <div v-if="formData[planCategory + '_type'] === 'fixed'" class="col-12">
            <div
                v-if="props.periods.length === 0"
                class="mt-1 p-3 message-danger"
            >
                <i class="pi pi-times-circle mr-2"></i>
                <span>{{ $t('common.no_plan_periods') }}</span>
            </div>
            <div
                class="flex flex-wrap justify-content-start gap-2"
                v-for="(period, i) in formData[planCategory + '_periods']"
                :key="i"
            >
                <div class="field custom-col-1">
                    <InputField
                        :id="`${planCategory + '_periods'}.${i}.days`"
                        variant="number"
                        v-model="period.days"
                        :addon-after="$t('common.days')"
                    />
                </div>
                <div class="field custom-col-2">
                    <InputField
                        :id="`${
                            planCategory + '_periods'
                        }.${i}.plan_period_precedence`"
                        variant="dropdown"
                        v-model="period.plan_period_precedence"
                        :options="precedenceDropDownOptions"
                        optionLabel="name"
                        :placeholder="$t('common.precedence')"
                    />
                </div>
                <div class="field custom-col-3">
                    <InputField
                        :id="`${planCategory + '_periods'}.${i}.plan_period_id`"
                        variant="dropdown"
                        v-model="period.plan_period_id"
                        :options="props.periods"
                        optionLabel="name"
                        :placeholder="$t('common.periods')"
                        :tooltip="true"
                    />
                </div>
                <div class="field custom-col-4">
                    <InputField
                        :id="`${
                            planCategory + '_periods'
                        }.${i}.plan_period_date_reference`"
                        variant="dropdown"
                        v-model="period.plan_period_date_reference"
                        :options="periodDateReferenceOptions[i]"
                        optionLabel="name"
                        :placeholder="$t('common.period_date_reference')"
                    />
                </div>
                <div class="field col-1 mt-1">
                    <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-outlined p-button-danger"
                        @click="remove(period)"
                        data-testid="remove-period"
                    />
                </div>
            </div>
        </div>
    </div>
    <div class="flex mt-3" v-if="formData[planCategory + '_type'] === 'fixed'">
        <div>
            <Button
                text
                :disabled="props.periods.length === 0"
                :label="$t('plans.new_period')"
                @click="addNewPeriod"
                icon="pi pi-plus"
                data-testid="add-new-period"
            />
        </div>
    </div>
</template>

<style scoped>
.custom-col-1 {
    width: 15%;
}

.custom-col-2,
.custom-col-3 {
    width: 20%;
}

.custom-col-4 {
    width: 30%;
}
</style>
