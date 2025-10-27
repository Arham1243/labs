<script setup>
import { useAppCenterStore } from '@/modules/administration/stores';
import { useGlobalStore, useSessionStore } from '@/stores';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    items: { type: Array, required: true }
});

const { t } = useI18n();
const appCenterStore = useAppCenterStore();
const globalStore = useGlobalStore();
const loading = ref(props.loading);
const busy = ref(false);
const menu = ref();
const search = ref('');
const selectedItem = ref(null);
const isDialogVisible = ref(false);
const statusUpdateDialog = ref(false);
const isEditMode = ref(false);
const formData = ref({});
const rows = ref(4);
const currentPage = ref(0);
const currentPageReportTemplate = ref('{first} - {last} of {totalRecords}');
const emit = defineEmits(['reloadItems']);

const filteredItems = computed(() => {
    if (!search.value) return props.items;
    return props.items.filter(
        (item) =>
            item.name.toLowerCase().includes(search.value.toLowerCase()) ||
            item.description.toLowerCase().includes(search.value.toLowerCase())
    );
});

const paginationStart = computed(() => {
    return currentPage.value * rows.value + 1;
});

const paginationEnd = computed(() => {
    const end = (currentPage.value + 1) * rows.value;
    return end > filteredItems.value.length ? filteredItems.value.length : end;
});

const paginatedItems = computed(() => {
    const start = currentPage.value * rows.value;
    return filteredItems.value.slice(start, start + rows.value);
});

const formattedConfig = computed(() => {
    if (!selectedItem.value) return [];
    return selectedItem.value.company_app.config.map((config) => ({
        ...config,
        options: config.options
            ? Object.entries(config.options).map(([value, name]) => ({
                  value,
                  name
              }))
            : []
    }));
});

const initializeFormData = (item) => {
    const initialData = {};

    item.company_app.config.forEach((config) => {
        if (config.type === 'list') {
            initialData[config.name] = (config.value || []).map((entry) => {
                const obj = {};
                entry.forEach(({ name, value }) => {
                    obj[name] = value;
                });
                return obj;
            }) || [{}];
        } else {
            initialData[config.name] = config.value || null;
        }
    });

    formData.value = initialData;
};

const addNewEntry = (configName) => {
    const baseEntry = formData.value[configName][0];
    const emptyEntry = Object.fromEntries(
        Object.keys(baseEntry).map((key) => [key, ''])
    );

    if (baseEntry) {
        formData.value[configName].push(JSON.parse(JSON.stringify(emptyEntry)));
    }
};

const removeEntry = (configName, index) => {
    formData.value[configName].splice(index, 1);
};

const openDialog = (mode = 'add', item) => {
    selectedItem.value = item;
    isEditMode.value = mode === 'edit';
    initializeFormData(selectedItem.value);
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const onShow = () => {
    resetForm();
};
const resetForm = () => {
    formData.value = {};
    globalStore.clearErrors();
};

const save = async () => {
    try {
        busy.value = true;
        const payload = JSON.parse(JSON.stringify(formData.value));

        if (!isEditMode.value) {
            await appCenterStore.activateApp(selectedItem.value.id, {
                config: payload
            });
        } else {
            await appCenterStore.configureApp(selectedItem.value.id, {
                config: payload
            });
        }
        emit('reloadItems');
        closeDialog();
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const sessionStore = useSessionStore();

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    return [
        {
            label: t('app_center.manage'),
            icon: 'pi pi-pencil',
            command: () => openDialog('edit', selectedItem.value)
        },
        {
            label: t('app_center.deactivate'),
            icon: 'pi pi-times',
            disabled:
                selectedItem.value?.name?.toLowerCase() ===
                sessionStore.settings?.default_payment_gateway,
            command: () => showStatusUpdateDialog()
        }
    ];
});

const dialogHeader = computed(() => {
    return selectedItem.value?.name;
});

const statusDialogHeader = computed(() => {
    return t('app_center.deactivate_payment_provider', {
        item: selectedItem.value?.name
    });
});
const statusDialogContent = computed(() => {
    return t('app_center.are_you_sure_deactivate', {
        item: selectedItem.value?.name
    });
});

const onPageChange = (event) => {
    currentPage.value = event.page;
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showActions = (event, item, index) => {
    selectedItem.value = item;
    menu.value[index].toggle(event);
};
const updateStatus = async () => {
    try {
        loading.value = true;
        await appCenterStore.deactivateApp(selectedItem.value.id);
        emit('reloadItems');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="custom-search flex items-end justify-end col-span-12 mb-6 pt-4">
        <div class="w-auto">
            <Search data-testId="search-input" v-model="search" />
        </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
        <div
            class="col-span-6 p-1"
            v-for="(provider, index) in paginatedItems"
            :key="index"
        >
            <div
                class="payment-card bg-white rounded-md border-2 border-surface-50 dark:border-surface-800 p-12"
                :data-testid="'payment-card-' + index"
            >
                <div class="flex gap-4">
                    <div class="icon">
                        <img
                            :src="provider.image"
                            :alt="provider.name"
                            :data-testid="'provider-image-' + index"
                        />
                    </div>
                    <div class="info">
                        <div class="flex gap-20">
                            <div
                                class="name font-bold"
                                :data-testid="'provider-name-' + index"
                            >
                                {{ provider.name }}
                            </div>
                            <StatusTag
                                v-if="provider.company_app.status"
                                :status="provider.company_app.status"
                                :data-testid="'status-tag-' + index"
                            />
                        </div>
                        <div
                            class="text-base font-semibold mt-1 text-black/50"
                            :data-testid="'provider-category-' + index"
                        >
                            {{ provider.category_label }}
                        </div>
                    </div>
                </div>
                <div
                    class="mb-6 mt-10 description font-medium text-black/50"
                    :data-testid="'provider-description-' + index"
                >
                    {{ provider.description }}
                </div>
                <div class="perks pt-1 flex flex-wrap">
                    <div
                        class="perk flex gap-2"
                        v-for="(feature, featureIndex) in provider.features"
                        :key="featureIndex"
                        :data-testid="`provider-feature-${index}-${featureIndex}`"
                    >
                        <i class="mt-1 pi pi-check"></i>{{ feature }}
                    </div>
                </div>
                <template
                    v-if="
                        $ability.can('create app centers') ||
                        $ability.can('update app centers')
                    "
                >
                    <div class="edit-cancel-button">
                        <Button
                            v-if="provider.company_app.status !== 'active'"
                            :label="$t('app_center.activate')"
                            size="medium"
                            class="mt-10"
                            :data-testid="'activate-button-' + index"
                            @click="openDialog('add', provider)"
                        />

                        <Button
                            v-else
                            :label="$t('common.actions')"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            size="medium"
                            class="p-button-outlined mt-10"
                            @click="showActions($event, provider, index)"
                            :data-testid="'actions-button-' + index"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                            :data-testid="'actions-menu-' + index"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-12 gap-4 mt-6">
        <div
            class="col-span-12 bg-white p-6 rounded-md"
            v-if="filteredItems.length > 0"
        >
            <Paginator
                :rows="rows"
                :totalRecords="filteredItems.length"
                @page="onPageChange"
                :currentPageReportTemplate="currentPageReportTemplate"
                class="flex justify-end"
            >
                <template #start>
                    <div class="p-text-secondary text-base">
                        Showing {{ paginationStart }} to {{ paginationEnd }} of
                        {{ filteredItems.length }} entries
                    </div>
                </template>
                <template #end>
                    <Select
                        v-model="rows"
                        :options="[4, 8, 12]"
                        placeholder="Items per page"
                        style="width: 80px"
                        class="mr-12"
                        @update:modelValue="currentPage = 0"
                    />
                </template>
            </Paginator>
        </div>
        <div class="col-span-12" v-else>
            <div class="flex items-center justify-center gap-2 mt-12">
                <i class="pi pi-exclamation-circle"></i>
                {{ t('administration.not_found') }}
            </div>
        </div>
    </div>

    <Confirmation
        v-model="statusUpdateDialog"
        :header="statusDialogHeader"
        :content="statusDialogContent"
        confirm-button-class="p-button-danger"
        :confirm-button-text="$t('app_center.deactivate')"
        @confirm="updateStatus"
        dialog-testid="status-update-dialog"
        close-button-testid="status-update-close-button"
        cancel-button-testid="status-update-cancel-button"
        confirm-button-testid="status-update-confirm-button"
        header-testid="status-update-title"
        content-testid="status-update-content"
        v-if="$ability.can('update app centers')"
    />

    <Dialog
        data-testId="dialog"
        v-model:visible="isDialogVisible"
        @update:visible="onShow"
        :header="dialogHeader"
        :style="{ width: '45vw' }"
        modal
        :closable="false"
        v-if="
            $ability.can('create app centers') ||
            $ability.can('update app centers')
        "
    >
        <template #header>
            <div
                class="flex items-center justify-between w-full edit-cancel-button"
            >
                <div class="p-dialog-title" data-testid="dialog-title">
                    {{ dialogHeader }}
                </div>
                  <Button
                    icon="pi pi-times"
                    data-testid="dialog-close-button"
                    @click="closeDialog"
                    aria-label="Close"
                    rounded
                    text
                />
            </div>
        </template>
        <div class="grid grid-cols-12 gap-4">
            <template v-for="config in formattedConfig" :key="config.name">
                <div class="col-span-12 mb-2">
                    <label class="block required mb-2" :for="config.name">
                        {{ config.label }}
                    </label>

                    <InputField
                        v-if="config.type === 'text'"
                        :id="config.name"
                        :placeholder="[config.placeholder]"
                        variant="text"
                        v-model="formData[config.name]"
                        class="w-full"
                    />

                    <InputField
                        v-else-if="config.type === 'select'"
                        :id="config.name"
                        variant="select"
                        :placeholder="[config.placeholder][0]"
                        v-model="formData[config.name]"
                        :options="config.options"
                        optionLabel="name"
                        optionValue="value"
                        class="w-full"
                    />

                    <template v-else-if="config.type === 'list'">
                        <div class="repeater-container mt-4">
                            <div
                                v-for="(entry, index) in formData[config.name]"
                                :key="index"
                                class="repeater-item mb-4 p-6"
                                style="border-bottom: 1px solid #ccc"
                            >
                                <div
                                    class="grid grid-cols-12 gap-4 justify-between"
                                >
                                    <Badge
                                        :value="index + 1"
                                        :style="{
                                            width: '1.85rem',
                                            height: '1.85rem',
                                            fontSize: '1.03rem'
                                        }"
                                        :data-testid="`count-badge-${index}`"
                                        class="flex items-center justify-center font-bold"
                                    />
                                    <div class="col-span-10">
                                        <div
                                            class="grid grid-cols-12 gap-4 items-center"
                                        >
                                            <div
                                                v-for="field in config.value[0]"
                                                :key="field.name"
                                                class="col-span-6 mb-4"
                                            >
                                                <label
                                                    class="block required mb-2 font-medium"
                                                    >{{ field.label }}</label
                                                >
                                                <InputField
                                                    :placeholder="
                                                        field.placeholder
                                                    "
                                                    :id="`${config.name}.${index}.${field.name}`"
                                                    :type="
                                                        field.type === 'select'
                                                            ? 'select'
                                                            : 'text'
                                                    "
                                                    :variant="
                                                        field.type === 'select'
                                                            ? 'select'
                                                            : 'text'
                                                    "
                                                    v-model="
                                                        formData[config.name][
                                                            index
                                                        ][field.name]
                                                    "
                                                    :options="
                                                        field.options
                                                            ? Object.entries(
                                                                  field.options
                                                              ).map(
                                                                  ([v, n]) => ({
                                                                      value: v,
                                                                      name: n
                                                                  })
                                                              )
                                                            : []
                                                    "
                                                    optionLabel="name"
                                                    optionValue="value"
                                                    class="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-span-1">
                                        <Button
                                            rounded
                                            outlined
                                            severity="danger"
                                            :data-testid="`remove-row-${index}`"
                                            :disabled="index === 0"
                                            icon="pi pi-trash"
                                            @click="
                                                removeEntry(config.name, index)
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                class="ml-auto edit-cancel-button col-span-12 flex justify-end"
                            >
                                <Button
                                    icon="pi pi-plus"
                                    :label="t('app_center.add_more')"
                                    class="p-button-outlined mt-12"
                                    @click="addNewEntry(config.name)"
                                />
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <template #footer>
            <div class="edit-cancel-button">
                <Button
                    data-testId="cancel-button"
                    text
                    :label="$t('buttons.cancel')"
                    @click="closeDialog"
                    class="mr-2"
                />
                <Button
                    data-testId="save-button"
                    icon="pi pi-check"
                    :label="
                        isEditMode
                            ? $t('buttons.update')
                            : $t('app_center.activate')
                    "
                    @click="save"
                    :loading="busy"
                />
            </div>
        </template>
    </Dialog>
</template>
<style lang="scss">
.payment-card {
    height: 370px;
    overflow-y: auto;
}
.payment-card::-webkit-scrollbar {
    width: 7px;
}
.payment-card::-webkit-scrollbar-track {
    background: transparent;
}
.payment-card::-webkit-scrollbar-thumb {
    background: #89898967;
    border-radius: 100px;
}
.app-pagination :is(.p-paginator-right-content, .p-paginator-left-content) {
    width: fit-content !important;
    margin: 0 !important;
}
.icon {
    background: #eff3f8;
    width: 48px;
    aspect-ratio: 1/1;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.icon img {
    width: 35px;
}
.perks {
    gap: 1rem;
}
.perk {
    width: 48%;
    color: #0e4f26;
}
.name {
    font-size: 1.35rem;
}
</style>
