<script setup>
import { computed } from 'vue';

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

const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});
</script>

<template>
    <div class="grid grid-cols-12 mt-4">
        <div class="col-span-12">
            <LocaleField
                id="name"
                label="Code Set Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
                data-testid="code-set-name"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-12">
            <LocaleField
                id="description"
                label="Description"
                type="text"
                variant="textarea"
                autoResize
                :multiple="!isNew"
                v-model="formData.description"
                data-test-id="code-set-description"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-6">
            <label class="mb-2" data-testid="effective-date-label">Effective Date *</label>
            <InputField
                variant="date"
                id="effective_date"
                data-testid="effective-date-datepicker"
                v-model="formData.effective_date"
                class="w-full"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
