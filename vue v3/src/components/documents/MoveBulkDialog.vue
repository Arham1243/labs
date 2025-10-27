<script setup>
import lodash from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '@/stores/index.js';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    tree: {
        type: Object,
        required: true
    },
    selectedNodes: {
        type: Object,
        required: true
    },
    currentLocale: {
        type: Object,
        required: true
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'confirm',
    'update:modelValue',
    'cancel',
    'reset-selection'
]);
const globalStore = useGlobalStore();
const selectedFolder = ref(null);
const directories = ref([]);
const expandedKeys = ref({});

const selectedItemsCount = computed(() => {
    return Object.keys(props.selectedNodes).length;
});

const expandAllFolders = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) return;
    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            expandedKeys.value[node.key] = true;
            expandAllFolders(node.children);
        }
    }
};

onMounted(() => {
    directories.value = lodash.cloneDeep(props.tree.directories);
    directories.value = directories.value.filter((item) => {
        if (
            item.key !== 'Attached Benefits' &&
            item.key !== 'Attached Benefit Groups'
        ) {
            return item;
        }
    });

    const selectedKeys = Object.keys(props.selectedNodes);

    const removeSelectedFromTree = (nodes) => {
        return nodes.filter((node) => {
            if (selectedKeys.includes(node.key)) {
                return false;
            }

            if (node.children && Array.isArray(node.children)) {
                node.children = removeSelectedFromTree(node.children);
            }

            return true;
        });
    };
    directories.value = removeSelectedFromTree(directories.value);
    expandAllFolders(directories.value);
});

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const hasSelectedNodes = computed(() => {
    return Object.keys(props.selectedNodes).length > 0;
});

const toggleFolder = (folderKey) => {
    if (expandedKeys.value[folderKey]) {
        delete expandedKeys.value[folderKey];
    } else {
        expandedKeys.value[folderKey] = true;
    }
};

const selectFolder = (folder) => {
    selectedFolder.value = folder;
};

const selectRootLevel = () => {
    selectedFolder.value = {
        key: '',
        label: 'Root Level',
        isRootLevel: true
    };
};

const findNodeRecursively = (nodes, targetKey) => {
    if (!nodes || !Array.isArray(nodes)) return null;

    for (const node of nodes) {
        if (node.key === targetKey) {
            return node;
        }

        if (node.children && Array.isArray(node.children)) {
            const found = findNodeRecursively(node.children, targetKey);
            if (found) return found;
        }
    }
    return null;
};

const filterTopLevelItems = (selectedKeys) => {
    const topLevelKeys = [];

    for (const key of selectedKeys) {
        let isChildOfSelected = false;
        for (const otherKey of selectedKeys) {
            if (key !== otherKey && key.startsWith(otherKey + '/')) {
                isChildOfSelected = true;
                break;
            }
        }
        if (!isChildOfSelected) {
            topLevelKeys.push(key);
        }
    }
    return topLevelKeys;
};

const renderAllNodes = (nodes, level = 0) => {
    const result = [];

    if (!nodes || !Array.isArray(nodes)) return result;

    for (const node of nodes) {
        result.push({
            ...node,
            level: level,
            hasChildren: node.children && node.children.length > 0,
            isExpanded: expandedKeys.value[node.key] || false
        });

        if (
            expandedKeys.value[node.key] &&
            node.children &&
            node.children.length > 0
        ) {
            const childNodes = renderAllNodes(node.children, level + 1);
            result.push(...childNodes);
        }
    }
    return result;
};

const flattenedTree = computed(() => {
    const result = renderAllNodes(directories.value);
    return result;
});

const cancel = () => {
    emit('cancel');
};

const confirm = () => {
    if (!selectedFolder.value) {
        globalStore.showError('Error', 'No destination folder selected.');
        return;
    }

    const selectedKeys = Object.keys(props.selectedNodes);
    const topLevelKeys = filterTopLevelItems(selectedKeys);

    const documentIds = topLevelKeys
        .map((key) => {
            let node = props.tree.all
                ? props.tree.all.find((item) => item.key === key)
                : null;

            if (!node && props.tree.all) {
                node = findNodeRecursively(props.tree.all, key);
            }

            if (node && node.id) {
                return node.id;
            } else {
                return null;
            }
        })
        .filter((id) => id !== null);

    if (documentIds.length === 0) {
        globalStore.showError('Error', 'No valid documents selected to move.');
        return;
    }

    let destinationPath = selectedFolder.value.key;
    if (selectedFolder.value.isRootLevel) {
        destinationPath = '';
    }

    const data = {
        locale: props.currentLocale.id,
        document_ids: documentIds,
        newPath: destinationPath
    };
    emit('confirm', data);
    dialog.value = false;
    emit('reset-selection');
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="`Move ${selectedItemsCount} items`"
        :style="{ width: '500px' }"
        :closable="true"
        class="move-dialog"
    >
        <div class="move-dialog-content">
            <div class="move-to-section">
                <label class="font-bold mb-3 block">Move to</label>

                <div class="max-h-64 overflow-y-auto">
                    <!-- ROOT LEVEL -->
                    <div
                        class="folder-item flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer mb-2"
                        :class="{
                            'bg-blue-50 border-blue-200':
                                selectedFolder?.isRootLevel
                        }"
                        @click="selectRootLevel"
                    >
                        <div class="folder-content flex items-center flex-1">
                            <span class="flex-1 font-medium">Root</span>
                        </div>
                    </div>

                    <!-- EXISTING FOLDERS -->
                    <div
                        v-if="flattenedTree.length === 0"
                        class="text-gray-500 p-1"
                    >
                        No folders available to move to.
                    </div>
                    <div
                        v-for="node in flattenedTree"
                        :key="node.key"
                        class="folder-item flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer rounded"
                        :class="{
                            'bg-blue-50 border-blue-200':
                                selectedFolder?.key === node.key &&
                                !selectedFolder?.isRootLevel
                        }"
                        @click="selectFolder(node)"
                    >
                        <div
                            class="hierarchy-spacer flex items-center"
                            :style="{ width: node.level * 40 + 'px' }"
                        >
                            <template v-if="node.level > 0">
                                <span
                                    v-for="levelIndex in node.level"
                                    :key="levelIndex"
                                    class="hierarchy-indicator"
                                >
                                    &nbsp;&nbsp;&nbsp;
                                </span>
                                <span class="hierarchy-connector">&nbsp;</span>
                            </template>
                        </div>
                        <div class="folder-content flex items-center flex-1">
                            <i
                                v-if="node.hasChildren"
                                :class="
                                    node.isExpanded
                                        ? 'pi pi-chevron-down'
                                        : 'pi pi-chevron-right'
                                "
                                class="text-xs text-gray-500 mr-3 cursor-pointer"
                                @click.stop="toggleFolder(node.key)"
                            ></i>
                            <span v-else class="w-1"></span>

                            <i class="pi pi-folder text-gray-500 mr-3"></i>

                            <span class="flex-1">{{
                                node.label || node.key
                            }}</span>

                            <span
                                v-if="node.hasChildren"
                                class="text-xs text-gray-500 ml-2"
                            >
                                ({{ node.children.length }})
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button text label="Cancel" @click="cancel" class="p-button-text" />
            <Button
                :disabled="isLoading || !hasSelectedNodes || !selectedFolder"
                :loading="isLoading"
                label="Move"
                @click="confirm"
                class="p-button-primary"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.move-dialog-content {
    min-height: 100px;
}

.folder-item {
    transition: background-color 0.2s;
    border: 1px solid transparent;
}

.folder-item:hover {
    background-color: #f8f9fa !important;
}

.folder-item.selected {
    background-color: #e3f2fd !important;
    border-color: #2196f3 !important;
}

.hierarchy-spacer {
    flex-shrink: 0;
    font-family: monospace;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1;
}

.hierarchy-indicator {
    display: inline-block;
    width: 40px;
    text-align: left;
}

.hierarchy-connector {
    display: inline-block;
    width: auto;
}

.folder-content {
    min-width: 0;
}

.font-medium {
    font-weight: 500;
}
</style>
