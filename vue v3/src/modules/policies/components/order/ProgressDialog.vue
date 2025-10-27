<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    btnLabel: {
        type: String,
        default: ''
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    progress: {
        type: [Number, String],
        default: 0
    }
});

const emit = defineEmits(['input', 'abort', 'done']);

const showDialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const close = () => {
    emit('abort');
    emit('update:modelValue', false);
};

watch(
    () => props.progress,
    (newValue) => {
        if (newValue >= 100) {
            emit('done');
        }
    }
);
</script>

<template>
    <Dialog
        v-model:visible="showDialog"
        modal
        :header="title"
        :style="{ width: '40vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="false"
    >
        <div>
            <ProgressBar :value="progress"></ProgressBar>

            <div class="pt-5">{{ description }}</div>
        </div>
    </Dialog>
</template>
