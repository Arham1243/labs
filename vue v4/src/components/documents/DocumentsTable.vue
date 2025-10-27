<script setup>
import { onMounted, ref, watch } from 'vue';
import { useDocumentManagement } from '@/composables/documents/useDocumentManagement';
import { useDocumentEditState } from '@/composables/documents/useDocumentEditState';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import InputField from '../common/InputField.vue';
import NewDocumentDialog from './NewDocumentDialog.vue';
import RenameDocumentDialog from './RenameDocumentDialog.vue';
import MoveDocumentDialog from './MoveDocumentDialog.vue';
import MoveBulkDialog from '@/components/documents/MoveBulkDialog.vue';
import Label from '@/components/common/Label.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import FileDocumentViewer from '@/components/documents/FileDocumentViewer.vue';

const props = defineProps({
    type: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    isNew: {
        type: Boolean,
        default: true
    },
    isHide: {
        type: Boolean,
        default: false
    },
    permission: {
        type: String,
        default: null
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

provideEditState();
const { formatValue, initialize } = useDateFormatter();

const {
    isLoading,
    tree,
    all,
    localeList,
    currentLocale,
    expandedKeys,
    selectedNode,
    selectedNodes,
    menuItems,
    menu,
    bulkActionsMenu,
    bulkDownloadDialog,
    showNewFolderDialog,
    showNewFileDialog,
    showRenameDocumentDialog,
    showMoveDocumentDialog,
    showBulkMoveDialog,
    deleteDialog,
    duplicateDialog,
    bulkDeleteDialog,
    isLoadingMoveDocumentDialog,
    isLoadingBulkMoveDialog,
    isLoadingRenameDocumentDialog,
    bulkActionsMenuItems,
    showFileViewerDialog,
    fileViewerData,
    downloadProgress,
    isDownloading,
    downloadStatus,
    clearAllSelections,
    handleCheckboxClick,
    isAttachedNode,
    fetchDocuments,
    duplicateDocument,
    deleteDocument,
    renameDocument,
    moveDocument,
    moveBulk,
    bulkDelete,
    selectedDocumentsCount,
    bulkDownload,
    showActions,
    showBulkActionsMenu,
    showDeleteDialog,
    showDuplicateDialog,
    showBulkDeleteDialog,
    showBulkDownloadDialog,
    onNodeSelect,
    confirmNewDocument,
    toggleNodeExpansion,
    openDocument,
    downLoadDocument,
    calculateFolderInfo,
    calculateTotalFileSize,
    getIconForFileType,
    getFileExtension,
    truncateFileName
} = useDocumentManagement(props);

const { isEditing, isEditDisabled, handleEdit, handleCancel } =
    useDocumentEditState(props);

watch(currentLocale, () => {
    fetchDocuments();
});

onMounted(() => {
    initialize();
});

fetchDocuments();
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <h5>
                <Label test-id="page-title">
                    {{ $t('common.documents') }}</Label
                >
            </h5>
            <div class="flex items-center gap-2 edit-cancel-button">
                <div>
                    <InputField
                        data-testid="locale-list-input"
                        id="currentLocale"
                        variant="select"
                        v-model="currentLocale"
                        :options="localeList"
                        optionLabel="name"
                        :placeholder="$t('common.select')"
                    />
                </div>
                <div v-if="!isNew">
                    <Button
                        data-testid="cancel-button"
                        v-if="isEditing"
                        label="Done"
                        icon="pi pi-check"
                        class="p-button mr-2"
                        @click="handleCancel"
                    />
                    <Button
                        data-testid="edit-button"
                        v-else-if="
                            !props.permission || $ability.can(props.permission)
                        "
                        size="small"
                        text
                        class="px-2 py-1 p-button-outlined"
                        :label="$t('buttons.edit')"
                        icon="pi pi-pencil"
                        :disabled="isEditDisabled"
                        @click="handleEdit"
                    />
                </div>
            </div>
        </div>
        <TreeTable
            :value="tree.all"
            v-model:selectionKeys="selectedNodes"
            v-model:expandedKeys="expandedKeys"
            :loading="isLoading"
            :resizableColumns="true"
            @nodeSelect="onNodeSelect"
            rowHover
            toggleableRows
        >
            <template v-if="(isNew || isEditing) && !isHide" #header>
                <div
                    class="flex justify-between flex-col sm:flex-row edit-cancel-button"
                >
                    <div class="flex">
                        <Button
                            data-testid="bulk-action-button"
                            :label="$t('buttons.bulk_actions')"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined mr-2"
                            :disabled="Object.keys(selectedNodes).filter(key => selectedNodes[key]?.checked).length === 0"
                            @click="showBulkActionsMenu"
                        />
                        <Menu
                            ref="bulkActionsMenu"
                            id="overlay_menu"
                            :model="bulkActionsMenuItems"
                            :popup="true"
                        />
                        <Button
                            data-testid="new-folder-button"
                            icon="pi pi-folder-open"
                            class="mx-2 p-button-outlined"
                            @click="showNewFolderDialog = true"
                            :label="$t('documents.new_folder')"
                        />
                        <Button
                            data-testid="upload-button"
                            :label="$t('common.upload')"
                            icon="pi pi-upload"
                            class="ml-2 p-button-outlined"
                            @click="showNewFileDialog = true"
                        />
                    </div>
                </div>
            </template>
            <template #empty>
                {{
                    $t('common.datatable_no_found', {
                        item: $t('common.documents').toLowerCase()
                    })
                }}
            </template>
            <template #loading>
                {{
                    $t('common.datatable_loading', {
                        item: $t('common.documents').toLowerCase()
                    })
                }}
            </template>
            <Column
                selectionMode="multiple"
                style="width: 50px"
                v-if="(isNew || isEditing) && !isHide"
            >
                <template #body="{ node }">
                    <div v-if="!isAttachedNode(node)">
                        <Checkbox
                            :binary="true"
                            :modelValue="!!selectedNodes[node.key]?.checked"
                            @update:modelValue="(value) => {
                            const toggleSelection = (currentNode, select) => {
                                if (!currentNode) return;
                                if (select && !isAttachedNode(currentNode)) {
                                selectedNodes[currentNode.key] = { checked: true };
                                } else if (!select) {
                                    delete selectedNodes[currentNode.key];
                                }
                                if (currentNode.children && currentNode.children.length > 0) {
                                    currentNode.children.forEach((child) =>
                                    toggleSelection(child, select)
                                );
                                }
                            };
                            toggleSelection(node, value);
                            }"
                            class="cursor-pointer"
                        />

                    </div>
                </template>
            </Column>
            <Column
                field="name"
                expander
                class="flex items-center"
                style="height: 65px"
            >
                <template #header>
                    <Label test-id="name-label">{{
                            $t('documents.name')
                        }}</Label>
                </template>
                <template #body="{ node }">
                    <div @click="toggleNodeExpansion(node)" class="w-full">
                        <template v-if="node.data.size == 'N/A'">
                            <i
                                :class="[
                                    'document-icon',
                                    expandedKeys[node.key]
                                        ? 'pi pi-folder-open'
                                        : 'pi pi-folder'
                                ]"
                            ></i>
                            {{ truncateFileName(node.data.name, 30) }}
                        </template>
                        <template v-else>
                            <i
                                :class="[
                                    'document-icon',
                                    getIconForFileType(node.data.name)
                                ]"
                            ></i>
                            <span
                                class="ml-2 hover:underline"
                                @click="
                                    () => {
                                        selectedNode = node;
                                        openDocument();
                                    }
                                "
                                data-testid="document-name"
                            >
                                {{ truncateFileName(node.data.name, 30) }}
                            </span>
                        </template>
                    </div>
                </template>
            </Column>
            <Column field="size">
                <template #header>
                    <Label test-id="size-label">{{
                            $t('documents.size')
                        }}</Label>
                </template>
                <template #body="{ node }">
                    <div @click="toggleNodeExpansion(node)">
                        <template v-if="node.data.size === 'N/A'">
                            <span>{{ calculateFolderInfo(node) }}</span>
                        </template>
                        <template v-else>
                            {{ node.data.size }}
                        </template>
                    </div>
                </template>
            </Column>
            <Column field="type">
                <template #header>
                    <Label test-id="type-label">{{
                            $t('documents.type')
                        }}</Label>
                </template>
                <template #body="{ node }">
                    <div @click="toggleNodeExpansion(node)">
                        <template v-if="node.data.size == 'N/A'">
                            {{ $t('documents.folder') }}
                        </template>
                        <template v-else>
                            {{ getFileExtension(node.data.name) }}
                        </template>
                    </div>
                </template>
            </Column>
            <Column field="last_modified">
                <template #header>
                    <Label test-id="last-modified-label">{{
                            $t('common.last_modified')
                        }}</Label>
                </template>
                <template #body="{ node }">
                    <div @click="toggleNodeExpansion(node)">
                        {{
                            formatValue(node.data.info.last_modified, {
                                type: 'date',
                                format: 'long'
                            }) +
                            ' ' +
                            formatValue(node.data.info.last_modified, {
                                type: 'time',
                                format: 'short'
                            })
                        }}
                    </div>
                </template>
            </Column>
            <Column v-if="(isNew || isEditing) && !isHide">
                <template #body="{ node }">
                    <template v-if="!node.data.is_attached">
                        <div class="flex justify-end">
                            <Button
                                :label="$t('common.actions')"
                                icon="pi pi-chevron-down"
                                iconPos="right"
                                size="small"
                                class="p-button-outlined"
                                @click="showActions($event, node)"
                                data-testid="actions-button"
                            />
                            <Menu
                                ref="menu"
                                id="overlay_menu"
                                :model="menuItems"
                                :popup="true"
                            />
                        </div>
                    </template>
                </template>
            </Column>
        </TreeTable>
        <NewDocumentDialog
            v-if="showNewFolderDialog"
            v-model="showNewFolderDialog"
            @confirm="confirmNewDocument"
            @cancel="showNewFolderDialog = false"
            :tree="tree"
            :type="props.type"
            :id="props.id"
            :localeList="localeList"
            :currentLocale="currentLocale"
        />
        <NewDocumentDialog
            v-if="showNewFileDialog"
            v-model="showNewFileDialog"
            @confirm="confirmNewDocument"
            @cancel="showNewFileDialog = false"
            :isFile="true"
            :tree="tree"
            :type="props.type"
            :id="props.id"
            :localeList="localeList"
            :currentLocale="currentLocale"
        />
        <RenameDocumentDialog
            v-model="showRenameDocumentDialog"
            @confirm="renameDocument"
            @cancel="showRenameDocumentDialog = false"
            :selectedNode="selectedNode"
            :localeList="localeList"
            :currentLocale="currentLocale"
            :isLoading="isLoadingRenameDocumentDialog"
        />
        <MoveDocumentDialog
            v-if="showMoveDocumentDialog"
            v-model="showMoveDocumentDialog"
            :tree="tree"
            @confirm="moveDocument"
            @cancel="showMoveDocumentDialog = false"
            :selectedNode="selectedNode"
            :localeList="localeList"
            :isLoading="isLoadingMoveDocumentDialog"
            :currentLocale="currentLocale"
        />
        <MoveBulkDialog
            v-if="showBulkMoveDialog"
            v-model="showBulkMoveDialog"
            :tree="tree"
            @confirm="moveBulk"
            @cancel="showBulkMoveDialog = false"
            :selectedNodes="selectedNodes"
            :currentLocale="currentLocale"
            @reset-selection="clearAllSelections"
            :isLoading="isLoadingBulkMoveDialog"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('documents.delete_selected_documents_header')"
            :content="$t('documents.delete_selected_documents_content')"
            confirm-button-class="p-button-danger"
            @confirm="deleteDocument"
        />
        <Confirmation
            v-model="duplicateDialog"
            show-alert-icon
            :header="$t('documents.duplicate_selected_documents_header')"
            :content="$t('documents.duplicate_selected_documents_content')"
            confirm-button-class="p-button-success"
            :confirm-button-text="$t('buttons.duplicate')"
            @confirm="duplicateDocument"
        />
        <Confirmation
            v-model="bulkDeleteDialog"
            :header="
                $t('documents.delete_selected_documents_header', {
                    count: selectedDocumentsCount
                })
            "
            :content="
                $t('documents.delete_selected_documents_content', {
                    count: selectedDocumentsCount
                })
            "
            confirm-button-class="p-button-danger"
            @confirm="bulkDelete"
        />
        <Confirmation
            v-model="bulkDownloadDialog"
            show-alert-icon
            :header="$t('documents.download_selected_documents_header')"
            :content="$t('documents.download_selected_documents_content')"
            confirm-button-class="p-button-primary"
            @confirm="bulkDownload"
        />

        <FileDocumentViewer
            v-model:visible="showFileViewerDialog"
            :fileData="fileViewerData"
            :getIconForFileType="getIconForFileType"
            :downLoadDocument="downLoadDocument"
        />

        <div v-if="isDownloading" class="download-progress-overlay">
            <div class="download-progress-card">
                <h4>{{ downloadStatus }}</h4>
                <ProgressBar :value="downloadProgress" />
                <p>{{ downloadProgress }}% Complete</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-button-label) {
    font-weight: bold;
}

.document-icon[class*='pi-file-pdf'] {
    color: #ff5722;
}

.document-icon[class*='pi-image'] {
    color: #3f51b5;
}

.download-progress-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.download-progress-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 400px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.download-progress-card h4 {
    margin-bottom: 1rem;
    color: #333;
}

.download-progress-card p {
    margin-top: 0.5rem;
    color: #666;
}
</style>
