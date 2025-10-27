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
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <LocaleField
                id="name"
                label="Code Set Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
                data-testid="code-set-name"
            />
        </div>
        <div class="field col-12">
            <LocaleField
                id="description"
                label="Description"
                type="text"
                variant="textarea"
                autoResize
                :multiple="!isNew"
                v-model="formData.description"
                data-test-id="code-set-description"
            />
        </div>
        <div class="field col-6">
            <label data-testid="effective-date-label">Effective Date *</label>
            <DatePicker
                id="effective_date"
                data-testid="effective-date-datepicker"
                v-model="formData.effective_date"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
