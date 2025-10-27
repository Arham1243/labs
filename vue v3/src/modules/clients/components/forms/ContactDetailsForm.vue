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
            <label for="email" data-testid="first-name-label">First Name</label>
            <InputField
                id="first_name"
                variant="text"
                v-model="formData.first_name"
                data-testid="first-name-input"
            />
        </div>
        <div class="field col-12">
            <label for="email" data-testid="last-name-label">Last Name</label>
            <InputField
                id="last_name"
                variant="text"
                v-model="formData.last_name"
                data-testid="last-name-input"
            />
        </div>
        <div class="field col-12">
            <label for="email" data-testid="email-label">Email Address</label>
            <InputField
                id="address"
                variant="text"
                data-testid="email-input"
                v-model="formData.email"
            />
        </div>
        <div class="field col-12">
            <label data-testid="phone-label" for="phone_number">Phone #</label>
            <InputField
                id="phone_number"
                variant="phone"
                v-model="formData.phone_number"
                data-testid="phone-input"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
