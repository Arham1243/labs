<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    header: {
        type: String,
        default: 'Confirm'
    },
    file: {
        type: String,
        default: ''
    },
    size: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    },
    errors: {
        type: Array,
        default: () => []
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    confirmButtonIcon: {
        type: String,
        default: ''
    },
    cancelButtonIcon: {
        type: String,
        default: ''
    },
    cancelButtonText: {
        type: String,
        default: 'Close'
    },
    confirmButtonText: {
        type: String,
        default: 'Confirm'
    },
    confirmButtonClass: {
        type: String,
        default: ''
    },
    cancelButtonClass: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['confirm', 'update:modelValue']);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const confirm = () => {
    emit('confirm');
};

const cancel = () => {
    emit('cancel');
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="header"
        :style="{ width: '40vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="false"
    >
        <div>
            <Message v-if="errors.length" severity="error" :closable="false">
                <ul>
                    <li
                        v-for="e in errors"
                        :key="`import-error-key-${e.row_number}`"
                    >
                        <span v-if="e.message">{{ e.message }}</span>
                        <span v-else>
                            Row number {{ e.row_number }} has
                            {{ e.errors.length }} errors [{{
                                e.errors.join(', ')
                            }}]
                        </span>
                    </li>
                </ul>
            </Message>
            <p>{{ file }}</p>
            <p>{{ Number((size / 1024).toFixed(2)) }}KB</p>
            <ProgressBar :value="progress" />
        </div>
        <template #footer>
            <Button
                text
                autofocus
                :label="cancelButtonText"
                :icon="cancelButtonIcon"
                @click="cancel"
                :class="cancelButtonClass"
            />
            <Button
                :label="confirmButtonText"
                :disabled="!isEnabled"
                :icon="confirmButtonIcon"
                @click="confirm"
                :class="confirmButtonClass"
            />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
