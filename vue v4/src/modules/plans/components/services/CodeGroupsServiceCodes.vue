<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useCodeSetStore } from '../../stores/CodeSet';
import ServiceCodesTable from '@/modules/plans/components/services/tables/ServiceCodesTable.vue';
import useEventsBus from '@/composables/event-bus';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    codeSetId: {
        type: [String, Number],
        required: true
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

const codeSetStore = useCodeSetStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const tags = ref([]);
const refresh = ref(1);
const busy = ref(false);
const isEditing = ref(false);
const selectedTags = ref([]);
const loadingTags = ref(false);

const incl = ref();
const excl = ref();
const inclRefresh = ref(1);
const exclRefresh = ref(1);
const { bus } = useEventsBus();
const includedServiceCodesCount = ref(0);
const excludedServiceCodesCount = ref(0);

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

watch(
    () =>
        bus.value.get('excludedServiceCodesCount') &&
        bus.value.get('includedServiceCodesCount'),
    async () => {
        includedServiceCodesCount.value = bus.value.get(
            'includedServiceCodesCount'
        );
        excludedServiceCodesCount.value = bus.value.get(
            'excludedServiceCodesCount'
        );
    }
);

onMounted(() => {
    getTags();
});

const isEditable = computed(() => {
    return isEditing.value || props.isNew;
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        isEditing.value = false;
        clearActiveComponent();
    }
};

const updateIncluded = (total) => {
    incl.value = total;
};

const updateExcluded = (total) => {
    excl.value = total;
};

const refreshIncluded = () => {
    inclRefresh.value++;
};

const refreshExcluded = () => {
    exclRefresh.value++;
};

const getTags = async () => {
    try {
        loadingTags.value = true;
        const res = await codeSetStore.getCodeSetTags(props.codeSetId);
        tags.value = res.data;
    } finally {
        loadingTags.value = false;
    }
};

const syncServiceCodes = async () => {
    if (!selectedTags.value.length) return;
    try {
        busy.value = true;
        const ids = selectedTags.value.map((item) => item.name);
        const payload = { resources: ids };
        await codeSetStore.syncCodeGroupByTags(props.id, payload);
        refresh.value++;
        selectedTags.value = [];
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-4 edit-cancel-button">
            <h5 data-testid="page-title">
                {{
                    isNew
                        ? 'Select service codes to include in code group'
                        : 'Services'
                }}
            </h5>
            <div v-if="!isNew">
                <Button
                    v-if="isEditing"
                    label="Done"
                    icon="pi pi-check"
                    class="p-button mr-2"
                    @click="handleCancel"
                    data-testid="cancel-button"
                />
                <Button
                    v-else-if="$ability.can('update service code groups')"
                    size="small"
                    text
                    class="px-2 py-1 p-button-outlined"
                    label="Edit"
                    icon="pi pi-pencil"
                    :disabled="isEditDisabled"
                    @click="handleEdit"
                    data-testid="edit-button"
                />
            </div>
        </div>

        <div v-if="isEditable" class="flex items-center mt-2 mb-3">
            <ApiMultiselect
                id="template"
                filter
                option-label="name"
                v-model="selectedTags"
                :loading="loadingTags"
                :options="tags"
                :items="tags"
                class="flex-grow-1"
                :placeholder="$t('services.find_service_codes_using_tags')"
                data-testid="tags-multiselect"
            />
            <div class="edit-cancel-button">
                <Button
                    size="small"
                    :loading="busy"
                    icon="pi pi-plus"
                    @click="syncServiceCodes"
                    class="p-button-rounded p-button-outlined ml-3"
                    data-testid="sync-button"
                />
            </div>
        </div>

        <Tabs :key="refresh" value="0">
            <TabList>
                <Tab value="0">Included ({{ Number(includedServiceCodesCount) || 0 }})</Tab>
                <Tab value="1">Excluded ({{ Number(excludedServiceCodesCount) || 0 }})</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <ServiceCodesTable
                        :id="id"
                        entity="groups"
                        :key="inclRefresh"
                        :show-exclude="isEditable"
                        :show-bulk-actions="isEditable"
                        @loaded="updateIncluded"
                        @updated="refreshExcluded"
                        :isEditing="isEditable"
                        data-testid="included-service-codes"
                    />
                </TabPanel>
                <TabPanel value="1">
                    <ServiceCodesTable
                        :id="id"
                        excluded
                        entity="groups"
                        :key="exclRefresh"
                        :show-include="isEditable"
                        :show-bulk-actions="isEditable"
                        @loaded="updateExcluded"
                        @updated="refreshIncluded"
                        data-testid="excluded-service-codes"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
