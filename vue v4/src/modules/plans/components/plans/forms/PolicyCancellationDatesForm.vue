<script setup>
import { ref, watch, reactive } from 'vue';
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';
import { useHelpers } from '@/composables';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    periods: {
        type: Array,
        default: () => []
    },
    periodName: {
        type: String,
        default: ''
    }
});

const helpers = useHelpers();

const emit = defineEmits(['update:modelValue', 'remove']);

const formData = reactive({ ...props.modelValue });

const { bus } = useEventsBus();

const { t } = useI18n();

const periods = ref(
    props.periods.map((item) => {
        return {
            name: lodash.truncate(item.name, {
                length: 20
            }),
            value: item.name
        };
    })
);

const periodDateReferenceOptions = ref([]);

watch(
    () => bus.value.get('periodsUpdated'),
    (value) => {
        periods.value = value[0].periods.map((item) => ({
            name: lodash.truncate(item.name, {
                length: 20
            }),
            value: item.name
        }));
        updatePeriodDateRefereneOptions();
    }
);

watch(
    formData,
    (newValue) => {
        emit('update:modelValue', lodash.cloneDeep(newValue));
        updatePeriodDateRefereneOptions();
    },
    { deep: true }
);

const remove = () => {
    emit('remove', formData.id);
};

const getPeriodDateValue = (date) => {
    const period = props.periods.find(
        (item) => item.name === formData.name?.value
    );
    const text = `${t(`common.${date}`)} ${
        period ? `(${helpers.formatDate(period[date], 'MMMM D')})` : ''
    }`;
    return text;
};

const updatePeriodDateRefereneOptions = () => {
    periodDateReferenceOptions.value = [
        { name: getPeriodDateValue('start_date'), value: 'start_date' },
        { name: getPeriodDateValue('end_date'), value: 'end_date' }
    ];
};

updatePeriodDateRefereneOptions();

if (formData.plan_period_date_reference?.value)
    formData.plan_period_date_reference.name = getPeriodDateValue(
        formData.plan_period_date_reference.value
    );

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
</script>

<template>
    <div class="flex flex-row items-center justify-between mb-4">
        <div class="col-span-2">
            <div class="custom-number-input">
                <InputField
                    :id="`${props.periodName}.${formData.id}.days`"
                    variant="number"
                    v-model="formData.days"
                    :addon-after="$t('common.days')"
                    data-testid="days"
                />
            </div>
        </div>
        <div class="col-span-3">
            <InputField
                :id="`${props.periodName}.${formData.id}.plan_period_precedence`"
                variant="select"
                v-model="formData.plan_period_precedence"
                :options="precedenceDropDownOptions"
                optionLabel="name"
                :placeholder="$t('common.precedence')"
                data-testid="plan_period_precedence"
            />
        </div>
        <div class="col-span-3 ml-2">
            <InputField
                :id="`${props.periodName}.${formData.id}.name`"
                variant="select"
                v-model="formData.name"
                :options="periods"
                optionLabel="name"
                :placeholder="$t('common.periods')"
                :tooltip="true"
                data-testid="name"
            />
        </div>
        <div class="col-span-3 ml-2">
            <InputField
                :id="`${props.periodName}.${formData.id}.plan_period_date_reference`"
                variant="select"
                v-model="formData.plan_period_date_reference"
                :options="periodDateReferenceOptions"
                optionLabel="name"
                :placeholder="$t('common.period_date_reference')"
                data-testid="plan_period_date_reference"
            />
        </div>
        <div class="col-span-1 mt-1 ml-2">
            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                variant="outlined"
                @click="remove"
                data-testid="remove"
            />
        </div>
    </div>
</template>
