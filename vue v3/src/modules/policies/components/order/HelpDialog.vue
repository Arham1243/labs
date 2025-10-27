<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    id: {
        type: String,
        default: 'help-container'
    },
    title: {
        type: String,
        default: 'Help'
    },
    btnLabel: {
        type: String,
        default: 'Continue'
    },
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'continue']);

const doNotShowHelp = ref(false);

const showDialog = computed(() => {
    if (props.modelValue) {
        const showPopup = localStorage.getItem(props.id);
        if (showPopup == 0) {
            proceed();
            close();
            return false;
        }

        return true;
    }

    return false;
});

const close = () => {
    emit('update:modelValue', false);
};

const proceed = () => {
    if (doNotShowHelp.value) {
        localStorage.setItem(props.id, 0);
    }

    emit('continue');
    close();
};

watch(
    () => props.modelValue,
    (newVal) => {
        if (!newVal) {
            doNotShowHelp.value = false;
        }
    }
);
</script>

<template>
    <Dialog
        v-if="showDialog"
        :visible="showDialog"
        modal
        :header="title"
        :style="{ width: '480px' }"
        @update:visible="close"
    >
        <template #header>
            <div class="p-dialog-title">{{ title }}</div>
        </template>
        <div class="p-fluid">
            <slot></slot>
        </div>
        <div class="flex justify-content-between align-items-center mt-5">
            <div class="field-checkbox mb-0">
                <Checkbox
                    name="show-help-checkbox"
                    v-model="doNotShowHelp"
                    binary
                ></Checkbox>
                <label htmlFor="show-help-checkbox">{{
                    $t(
                        'policies.order.bulk_import_help_dialog.do_not_show_checkbox_label'
                    )
                }}</label>
            </div>

            <Button :label="btnLabel" @click="proceed"></Button>
        </div>
    </Dialog>
</template>
