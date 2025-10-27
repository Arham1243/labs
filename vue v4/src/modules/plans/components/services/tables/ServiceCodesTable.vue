<script setup>
import lodash from 'lodash';
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCodeSetStore } from '../../../stores/CodeSet';
import { useHelpers } from '@/composables';
import ServiceCodeDialog from '../dialogs/ServiceCodeDialog.vue';
import { PaginationOptions, SortFilterOptions } from '@/config';
import useEventsBus from '@/composables/event-bus';
import VaporUploadToast from '@/components/VaporUploadToast.vue';
import { useGlobalStore } from '@/stores';

const props = defineProps({
    id: {
        type: [String, Number],
        required: false
    },
    entity: {
        type: String,
        required: true
    },
    showNew: {
        type: Boolean,
        default: false
    },
    showImport: {
        type: Boolean,
        default: false
    },
    showActions: {
        type: Boolean,
        default: false
    },
    showBulkActions: {
        type: Boolean,
        default: false
    },
    showInclude: {
        type: Boolean,
        default: false
    },
    showExclude: {
        type: Boolean,
        default: false
    },
    excluded: {
        type: Boolean,
        default: false
    },
    isEditing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['loaded', 'updated']);

const i18n = useI18n();
const { t } = useI18n();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();
const globalStore = useGlobalStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const confirmContent = ref('');
const excludeContent = ref('');
const busy = ref(false);
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const selectedItems = ref([]);
const isCodeDialog = ref(false);
const importFile = ref(null);
const uploadedImportFile = ref(null);
const importDialog = ref(false);
const importDialogErrors = ref([]);
const hasRunningImport = ref(false);
const progress = ref(0);
const importButton = ref(false);
const deleteDialog = ref(false);
const excludeDialog = ref(false);
const { emit: emits } = useEventsBus();

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onMounted(() => {
    getItems();
});

const menuItems = computed(() => {
    const items = [];
    if (props.entity == 'sets') {
        items.push({ label: 'Delete', command: () => showDeleteDialog() });
    } else if (props.entity == 'groups') {
        props.excluded
            ? items.push({
                  label: 'Include',
                  command: () => attachServiceCodes()
              })
            : items.push({
                  label: 'Exclude',
                  command: () => detachServiceCodes()
              });
    }
    return items;
});

const showExcludeDialog = (item) => {
    selectedItem.value = item;
    excludeContent.value = t('services.are_you_sure_exclude_service_code', {
        name: selectedItem.value.code,
        description: selectedItem.value.description[i18n.locale.value]
    });
    excludeDialog.value = true;
};

const showDeleteDialog = (item) => {
    if (selectedItems.value.length) {
        confirmContent.value = t('common.are_you_sure_delete_multiple', {
            count: selectedItems.value.length
        });
    } else {
        selectedItem.value = item;
        confirmContent.value = t('services.are_you_sure_delete_service_code', {
            name: selectedItem.value.code,
            description: selectedItem.value.description[i18n.locale.value]
        });
    }
    deleteDialog.value = true;
};

const showMenu = (event) => {
    menu.value.toggle(event);
};

const createServiceCode = () => {
    selectedItem.value = undefined;
    isCodeDialog.value = true;
};

const editServiceCode = (data) => {
    selectedItem.value = lodash.cloneDeep(data);
    isCodeDialog.value = true;
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const getItems = () => {
    if (props.excluded) getExcludedItems();
    else getEntityItems();
};

const getEntityItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await codeSetStore.searchEntityServiceCodes(
            props.entity,
            props.id,
            payload,
            params
        );

        items.value = res.data;
        totalRecords.value = res.meta.total;
        if (!searchText.value) {
            emits('includedServiceCodesCount', totalRecords.value);
            emit('loaded', res.meta.total);
        }
    } finally {
        loading.value = false;
    }
};

const getExcludedItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await codeSetStore.searchExcludedServicesCodes(
            props.entity,
            props.id,
            payload,
            params
        );
        items.value = res.data;
        totalRecords.value = res.meta.total;
        if (!searchText.value) {
            emits('excludedServiceCodesCount', totalRecords.value);
            emit('loaded', res.meta.total);
        }
    } finally {
        loading.value = false;
    }
};

const attachServiceCode = async (item) => {
    try {
        loading.value = true;
        await codeSetStore.attachServiceCodes(props.entity, props.id, {
            resources: [item.id]
        });
        getItems();
        emit('updated');
    } finally {
        loading.value = false;
    }
};

const attachServiceCodes = async () => {
    try {
        loading.value = true;
        const ids = selectedItems.value.map((item) => item.id);
        await codeSetStore.attachServiceCodes(props.entity, props.id, {
            resources: ids
        });
        getItems();
        emit('updated');
        selectedItems.value = [];
    } finally {
        loading.value = false;
    }
};

const detachServiceCodes = async () => {
    try {
        loading.value = true;
        const ids = selectedItems.value.length
            ? selectedItems.value.map((item) => item.id)
            : [selectedItem.value.id];
        await codeSetStore.detachServiceCodes(props.entity, props.id, {
            resources: ids
        });

        if (selectedItems.value.length == items.value.length) {
            pagination.resetPageParams();
        }
        getItems();
        emit('updated');
        selectedItems.value = [];
    } finally {
        loading.value = false;
    }
};

const handleFileUpload = (e) => {
    uploadedImportFile.value = e;
    importButton.value = true;
};

const handleFileInfo = (e) => {
    const file = e.files[0];
    importFile.value = file;
    importDialog.value = true;
};

const proceedImport = async () => {
    loading.value = true;
    hasRunningImport.value = true;
    importButton.value = false;
    progress.value += 5;

    try {
        const data = await codeSetStore.importServiceCodes({
            file: {
                key: uploadedImportFile.value.key
            },
            service_code_set_id: props.id
        });

        let interval = setInterval(async () => {
            let importLog = await codeSetStore.checkImportLogStatus(
                data.import_log_id
            );

            if (importLog.imported_at != null) {
                clearInterval(interval);
                getItems();
                emit('updated');
                loading.value = false;
                hasRunningImport.value = false;

                if (importLog.errors == null) {
                    onImportCancel();

                    if (importLog.duplicates) {
                        globalStore.showInfo(
                            'Info',
                            'Duplicates were found. Only the first entry will be used.'
                        );
                    }
                } else {
                    importDialogErrors.value = importLog.errors;
                    progress.value = 100;
                }
                return;
            }

            if (progress.value < 95) {
                progress.value += progress.value < 30 ? 5 : 1;
            }
        }, 5000);
    } catch (error) {
        getItems();
        emit('updated');
        loading.value = false;
        hasRunningImport.value = false;
        onImportCancel();
    }
};

const onImportCancel = () => {
    if (hasRunningImport.value === true) {
        return alert("You can't cancel a running import.");
    }

    importDialog.value = false;
    progress.value = 0;
    importFile.value = null;
    importDialogErrors.value = [];
};

const fileUploadToast = ref(null);
const showToast = (message) => {
    fileUploadToast.value.add({
        severity: 'error',
        summary: 'File exceed maximum size',
        detail: message,
        life: 6000
    });
};
</script>

<template>
    <div>
        <BaseTable
            :value="items"
            :loading="loading"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            @page="onPageChange"
            @sort="onSortChange"
            v-model:selection="selectedItems"
            data-testid="service-codes-table"
        >
            <template #header>
                <div
                    class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                >
                    <div
                        class="flex flex-wrap items-center gap-2 edit-cancel-button"
                        v-if="showBulkActions || showImport || showNew"
                    >
                        <Button
                            v-if="showBulkActions"
                            label="Bulk Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined mr-2"
                            :disabled="!selectedItems.length"
                            @click="showMenu"
                            data-testid="bulk-actions"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                            data-testid="bulk-actions-menu"
                        />
                        <VaporUploadToast
                            v-if="showImport"
                            @onUploaded="handleFileUpload"
                            @uploader="handleFileInfo"
                            label="Import File"
                            data-testid="import-file"
                            @showSeparateToast="showToast"
                        />
                        <Toast ref="fileUploadToast" />
                        <Button
                            v-if="showNew"
                            label="New Code"
                            icon="pi pi-plus"
                            class="ml-2"
                            @click="createServiceCode"
                            data-testid="new-code"
                        />
                    </div>
                    <div class="w-full sm:w-auto sm:max-w-xs">
                        <Search
                            v-model="searchText"
                            @search="search"
                            data-testid="search-input"
                        />
                    </div>
                </div>
            </template>

            <template #empty>
                <label data-testid="empty-state-message">
                    No service codes found...
                </label>
            </template>
            <template #loading> Loading service codes. Please wait. </template>

            <Column
                v-if="showBulkActions"
                selectionMode="multiple"
                headerStyle="width: 3rem"
            />
            <Column sortable field="code" header="Code"> </Column>
            <Column
                sortable
                :field="`description->${i18n.locale.value}`"
                header="Description"
                class="p-break-word"
            >
                <template #body="{ data }">
                    {{ helpers.getLocaleValue(data.description) }}
                </template>
            </Column>
            <Column header="Tags">
                <template #body="{ data }">
                    <div v-if="data.tags.length == 0">
                        <Button
                            v-if="
                                $ability.can(
                                    'update service code ' + props.entity
                                ) && props.isEditing
                            "
                            size="small"
                            text
                            class="px-2 py-1"
                            label="Add Tag"
                            icon="pi pi-plus"
                            @click="editServiceCode(data)"
                            data-testid="add-tag"
                        />
                    </div>
                    <div v-else>
                        <Tag
                            v-for="(tag, index) in data.tags"
                            :key="index"
                            :value="
                                lodash.truncate(tag.name, {
                                    length: 20
                                })
                            "
                            v-tooltip.top="{ value: tag.name }"
                            class="ml-1"
                            data-testid="tag"
                        />
                    </div>
                </template>
            </Column>
            <Column v-if="showActions">
                <template #body="{ data }">
                    <div class="flex flex-wrap items-center justify-end edit-cancel-button">
                        <Button
                            v-if="
                            $ability.can('update service code ' + props.entity)
                        "
                            @click="editServiceCode(data)"
                            icon="pi pi-pencil"
                            :disabled="selectedItems.length"
                            class="p-button-rounded p-button-text "
                            data-testid="edit-code"
                        />
                        <Button
                            v-if="$ability.can('update service code sets')"
                            :loading="busy"
                            icon="pi pi-trash"
                            :disabled="selectedItems.length"
                            class="p-button-rounded p-button-text p-button-danger"
                            @click="showDeleteDialog(data)"
                            data-testid="delete-code"
                        />
                    </div>

                </template>
            </Column>
            <Column header="Include" v-if="showInclude">
                <template #body="{ data }">
                    <div class="edit-cancel-button">
                        <Button
                            icon="pi pi-plus"
                            size="small"
                            outlined
                            rounded
                            class="p-button-outlined"
                            :disabled="selectedItems.length"
                            @click="attachServiceCode(data)"
                            data-testid="include-code"
                        />
                    </div>
                </template>
            </Column>
            <Column header="Exclude" v-if="showExclude">
                <template #body="{ data }">
                    <div class="edit-cancel-button">
                        <Button
                            icon="pi pi-times"
                            size="small"
                            rounded
                            outlined
                            class="p-button-outlined"
                            :disabled="selectedItems.length"
                            @click="showExcludeDialog(data)"
                            data-testid="exclude-code"
                        />
                    </div>
                </template>
            </Column>
        </BaseTable>
        <ImportDialog
            v-model="importDialog"
            :header="'Import code set file'"
            :file="importFile?.name"
            :size="importFile?.size"
            :errors="importDialogErrors"
            :progress="progress"
            :confirm-button-text="'Import'"
            :isEnabled="importButton"
            @confirm="proceedImport"
            @cancel="onImportCancel"
            data-testid="import-dialog"
        />
        <ServiceCodeDialog
            v-model="isCodeDialog"
            :service-code="selectedItem"
            @added="attachServiceCode"
            @refresh="getItems"
            :serviceCodeSetId="props.id"
            data-testid="service-code-dialog"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('services.delete_service_codes')"
            :content="confirmContent"
            confirm-button-class="p-button-danger"
            @confirm="detachServiceCodes"
            data-testid="delete-dialog"
        />
        <Confirmation
            v-model="excludeDialog"
            :header="$t('services.exclude_service_code')"
            :content="excludeContent"
            @confirm="detachServiceCodes"
            data-testid="exclude-dialog"
        />
    </div>
</template>
