<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const formData = ref(props.modelValue);

watch(formData, (value) => {
    emit('update:modelValue', value);
});
</script>
<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <LocaleField
                data-testid="input-name"
                id="name"
                label="Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
            />
        </div>
        <div class="field col-3">
            <label for="coverage">{{ $t('common.coverage') }}</label>
            <InputField
                data-testid="input-coverage"
                id="coverage"
                variant="number"
                addon-after="pi pi-percentage"
                v-model="formData.coverage"
            />
        </div>
        <div class="field col-3">
            <label for="max_amount">{{ $t('common.to_a_maximum_of') }}</label>
            <InputField
                data-testid="input-max-amount"
                id="max_amount"
                variant="number"
                addon-before="pi pi-dollar"
                v-model="formData.max_amount"
            />
        </div>
        <div class="field col-3">
            <label>{{ $t('common.effective_date') }} *</label>
            <DatePicker
                data-testid="input-effective-date"
                id="effective_date"
                v-model="formData.effective_date"
            />
        </div>
        <div class="field col-3">
            <label>{{ $t('common.end_date') }}</label>
            <DatePicker
                data-testid="input-end-date"
                id="end_date"
                v-model="formData.end_date"
            />
        </div>
        <div class="field col-6">
            <InputField
                variant="selectButton"
                id="bound"
                unselectable
                v-model="formData.bound"
                :options="[
                    { name: 'Inbound', value: 'in' },
                    { name: 'Outbound', value: 'out' }
                ]"
                optionLabel="name"
                aria-labelledby="basic"
                data-testid="bound-input"
            />
        </div>
        <div class="field col-6">
            <InputField
                variant="selectButton"
                id="type"
                unselectable
                v-model="formData.type"
                :options="[
                    { name: 'Domestic', value: 'domestic' },
                    { name: 'International', value: 'international' }
                ]"
                optionLabel="name"
                aria-labelledby="basic"
                data-testid="type-input"
            />
        </div>
    </div>
</template>
