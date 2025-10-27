<script setup>
import lodash from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    selectedNode: {
        type: Object
    },
    tree: {
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

const emit = defineEmits(['confirm', 'update:modelValue']);

const newName = ref(null);
const path = ref();
const directories = ref(lodash.cloneDeep(props.tree.directories));
const ext = ref(null);

onMounted(() => {
    directories.value = props.tree.directories.filter((item) => {
        if (
            item.key !== 'Attached Benefits' &&
            item.key !== 'Attached Benefit Groups'
        ) {
            return item;
        }
    });
});

watch(
    () => props.selectedNode,
    (newSelectedNode) => {
        if (newSelectedNode) {
            let n = newSelectedNode.key.split('/').reverse()[0] || '';

            if (n) {
                newName.value = n.split('.')[0];
                ext.value = n.split('.')[1];
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

const confirm = async () => {
    let data = {
        locale: props.currentLocale.id,
        document_id: props.selectedNode.id,
        newPath: getNewPath()
    };
    emit('confirm', data);
};

const cancel = () => {
    emit('cancel');
};

const getNewPath = () => {
    const name = props.selectedNode.key.split('/').reverse()[0] || '';
    const newPath = getPathFromTreeObject(path.value);
    if (newPath.length > 1) {
        return newPath + '/' + name;
    }
    return name;
};

const getPathFromTreeObject = (obj) => {
    if (!obj) {
        return '';
    }

    let p = Object.keys(obj)[0];

    return p;
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('documents.move_document')"
        :style="{ width: '40vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="false"
    >
        <div class="p-fluid formgrid grid">
            <div class="field col-12" v-if="directories.length">
                <label for="path">{{ $t('documents.parent_folder') }}</label>
                <TreeSelect
                    v-model="path"
                    :options="directories"
                    :placeholder="$t('documents.parent_folder')"
                    class="md:w-20rem w-full"
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
                :disabled="isLoading"
                :loading="isLoading"
                :label="$t('documents.move')"
                @click="confirm"
                data-testid="move-button"
            />
        </template>
    </Dialog>
</template>
