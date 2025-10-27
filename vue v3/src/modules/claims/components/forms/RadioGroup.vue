<script setup>
const props = defineProps({
    id: { type: String },
    label: { type: String },
    options: { type: Array },
    name: { type: String },
    required: { type: Boolean }
});

let vModel = defineModel();
</script>

<template>
    <div>
        <p :data-testid="'text-' + label">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </p>
        <label
            v-for="option in options"
            :key="option.label"
            :data-testid="'label-' + option.value"
            class="flex gap-2 align-items-center mt-2"
        >
            <RadioButton
                :name="name"
                :value="option.value"
                :data-testid="'radio-btn-' + option.value"
                v-model="vModel"
            />
            {{ option.label }}
        </label>
    </div>
</template>
