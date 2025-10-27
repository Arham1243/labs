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
    content: {
        type: String,
        default: 'Are you sure?'
    },
    icon: {
        type: String,
        default: 'pi-exclamation-triangle'
    },
    showAlertIcon: {
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
        default: 'Cancel'
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
    },
    dialogTestid: {
        type: String,
        default: ''
    },
    closeButtonTestid: {
        type: String,
        default: ''
    },
    cancelButtonTestid: {
        type: String,
        default: ''
    },
    confirmButtonTestid: {
        type: String,
        default: ''
    },
    contentTestid: {
        type: String,
        default: ''
    },
    headerTestid: {
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
    dialog.value = false;
};
</script>

<template>
    <Dialog
        :data-testid="dialogTestid"
        v-model:visible="dialog"
        modal
        :header="header"
        :style="{ width: '480px' }"
        :closable="false"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div class="p-dialog-title" :data-testid="headerTestid">
                    {{ header }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    :data-testid="closeButtonTestid"
                    @click="dialog = false"
                    aria-label="Close"
                />
            </div>
        </template>
        <div class="flex align-items-center">
            <i
                v-if="showAlertIcon"
                class="pi pi-exclamation-triangle mr-3"
                style="font-size: 2.5rem"
            />
            <p :data-testid="contentTestid">
                {{ content }}
            </p>
        </div>

        <template #footer>
            <Button
                :data-testid="cancelButtonTestid"
                text
                autofocus
                :label="cancelButtonText"
                :icon="cancelButtonIcon"
                @click="dialog = false"
                :class="cancelButtonClass"
            />
            <Button
                :data-testid="confirmButtonTestid"
                :label="confirmButtonText"
                :icon="confirmButtonIcon"
                @click="confirm"
                :class="confirmButtonClass"
            />
        </template>
    </Dialog>
</template>
