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
    <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12">
            <LocaleField
                data-testid="input-name"
                id="name"
                label="Name *"
                type="text"
                variant="text"
                class="w-full mb-4"
                :multiple="!isNew"
                v-model="formData.name"
            />
        </div>
        <div class="col-span-3">
            <label for="coverage" class="mb-2">{{ $t('common.coverage') }}</label>
            <div class="custom-number-input">
                <InputField
                    data-testid="input-coverage"
                    id="coverage"
                    variant="number"
                    addon-after="pi pi-percentage"
                    v-model="formData.coverage"
                />
            </div>
        </div>
        <div class="col-span-3">
            <label for="max_amount" class="mb-2">{{ $t('common.to_a_maximum_of') }}</label>
            <div class="custom-number-input">
                <InputField
                    data-testid="input-max-amount"
                    id="max_amount"
                    variant="number"
                    addon-before="pi pi-dollar"
                    v-model="formData.max_amount"
                />
            </div>
        </div>
        <div class="col-span-3">
            <label class="mb-2">{{ $t('common.effective_date') }} *</label>
            <InputField
                variant="date"
                data-testid="input-effective-date"
                id="effective_date"
                v-model="formData.effective_date"
            />
        </div>
        <div class="col-span-3">
            <label class="mb-2">{{ $t('common.end_date') }}</label>
            <InputField
                variant="date"
                data-testid="input-end-date"
                id="end_date"
                v-model="formData.end_date"
            />
        </div>
        <div class="col-span-6 my-2 custom-select-button">
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
        <div class="col-span-6 my-2 custom-select-button">
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
