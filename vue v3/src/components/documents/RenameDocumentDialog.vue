<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    selectedNode: {
        type: Object
    },
    localeList: {
        type: Array
    },
    currentLocale: {
        type: Object
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

const newName = ref(null);

const emit = defineEmits(['confirm', 'update:modelValue']);

watch(
    () => props.selectedNode,
    (newSelectedNode) => {
        if (newSelectedNode) {
            let n = newSelectedNode.key.split('/').reverse()[0] || '';
            if (n) {
                newName.value = n;
            }
        }
    }
);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const isConfirmDisabled = computed(() => {
    return getNewName() === props.selectedNode.key.split('/').pop();
});

const confirm = () => {
    let data = {
        locale: props.currentLocale.id,
        document_id: props.selectedNode.id,
        name: getNewName()
    };
    //console.log(data);
    emit('confirm', data);
};

const cancel = () => {
    emit('cancel');
};

const getNewName = () => {
    return newName.value;
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('documents.rename_document')"
        :style="{ width: '40vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="false"
    >
        <div class="p-fluid formgrid grid">
            <div class="field col-12">
                <label for="name">{{ $t('documents.new_name') }}</label>
                <InputText
                    id="name"
                    v-model="newName"
                    @keyup="newName = newName.replace(/\//g, '')"
                    data-testid="name"
                />
            </div>
        </div>

        <template #footer>
            <Button
                text
                autofocus
                :label="$t('buttons.cancel')"
                @click="cancel"
                data-testid="cancel-button"
            />
            <Button
                :loading="isLoading"
                :label="$t('documents.rename')"
                :disabled="isConfirmDisabled || isLoading"
                @click="confirm"
                data-testid="confirm-button"
            />
        </template>
    </Dialog>
</template>
