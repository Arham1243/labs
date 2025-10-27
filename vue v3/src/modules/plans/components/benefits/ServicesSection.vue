<script setup>
import { ref } from 'vue';

defineProps({
    readonly: {
        type: Boolean,
        default: false
    },
    codeSets: {
        type: Array,
        default: () => []
    },
    activeIndexes: {
        type: Array,
        default: () => []
    },
    addedServices: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits([
    'showLimitDialog',
    'showRemoveDialog',
    'showCoverageDialog'
]);

const menu = ref();
const searchText = ref('');
const loading = ref(false);
const selectedTableItems = ref([]);

const menuItems = ref([
    { label: 'Apply Coverage Limits', command: () => showLimitDialog() },
    { label: 'Exclude Codes', command: () => console.log('clicked') },
    { label: 'Select All 20 Services', command: () => console.log('clicked') },
    { label: 'Clear Selection', command: () => (selectedTableItems.value = []) }
]);

const tableItems = ref([
    {
        code: 'A4245',
        description: 'Platforms for home blood glucose monitor, 50 per box',
        coverage: '50',
        max: '100',
        coverage_restriction: ''
    },
    {
        code: 'A4245',
        description: 'Platforms for home blood glucose monitor, 50 per box',
        coverage: '50',
        max: '100',
        coverage_restriction: ''
    },
    {
        code: 'A4245',
        description: 'Platforms for home blood glucose monitor, 50 per box',
        coverage: '50',
        max: '100',
        coverage_restriction: ''
    },
    {
        code: 'A4245',
        description: 'Platforms for home blood glucose monitor, 50 per box',
        coverage: '50',
        max: '100',
        coverage_restriction: '90 Day Supply'
    }
]);

const showMenu = (event) => {
    menu.value.toggle(event);
};

const showLimitDialog = () => {
    emit('showLimitDialog');
};

const showCoverageDialog = () => {
    emit('showCoverageDialog');
};

const showRemoveDialog = (index) => {
    emit('showRemoveDialog', index);
};
</script>

<template>
    <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
    <Accordion :activeIndex="activeIndexes" multiple>
        <AccordionTab v-for="(service, index) in addedServices" :key="index">
            <template #header>
                <span
                    class="flex justify-content-between align-items-center gap-2 w-full"
                >
                    <div class="ml-2">
                        <h5>service one</h5>
                        <span class="text-xs font-light">
                            75% Coverage to a maximum of $400.00
                        </span>
                    </div>
                    <div class="flex align-items-center">
                        <Button
                            v-if="!readonly"
                            label="Edit Limit"
                            size="small"
                            @click.stop="showLimitDialog"
                            class="p-button-outlined mx-3"
                        />
                        <Button
                            v-if="!readonly"
                            icon="pi pi-times"
                            @click.stop="showRemoveDialog"
                            class="p-button-rounded p-button-text"
                        />
                    </div>
                </span>
            </template>
            <div class="m-0">
                <TabView>
                    <TabPanel header="Included (19)">
                        <div class="mt-5">
                            <BaseTable
                                v-model:selection="selectedTableItems"
                                :value="tableItems"
                                :rows="10"
                                dataKey="id"
                                :rowHover="true"
                                :loading="loading"
                                paginator
                                removable-sort
                                responsiveLayout="scroll"
                            >
                                <template v-if="!readonly" #header>
                                    <div
                                        class="flex justify-content-between align-items-center"
                                    >
                                        <Button
                                            :label="`Bulk Action ${
                                                selectedTableItems.length
                                                    ? `(${
                                                          selectedTableItems.length +
                                                          1
                                                      } Selected)`
                                                    : ''
                                            }`"
                                            iconPos="right"
                                            icon="pi pi-chevron-down"
                                            class="ml-2 p-button-outlined"
                                            @click="showMenu"
                                        />
                                        <Menu
                                            :ref="`menu_${index}`"
                                            id="overlay_menu"
                                            :model="menuItems"
                                            :popup="true"
                                        />
                                        <span class="p-input-icon-left ml-4">
                                            <i class="pi pi-search" />
                                            <InputText
                                                v-model="searchText"
                                                placeholder="Search"
                                            />
                                        </span>
                                    </div>
                                </template>
                                <template #empty>
                                    <Label data-testid="empty-state-message">
                                        No services found.
                                    </Label>
                                </template>
                                <template #loading>
                                    Loading services. Please wait.
                                </template>

                                <Column
                                    v-if="!readonly"
                                    selectionMode="multiple"
                                    headerStyle="width: 3rem"
                                />
                                <Column sortable field="code" header="Code" />
                                <Column
                                    sortable
                                    field="description"
                                    header="Description"
                                >
                                </Column>
                                <Column header="Coverage">
                                    <template #body="{ data }">
                                        <span class="p-input-icon-right">
                                            <i class="pi pi-percentage" />
                                            <InputText
                                                v-model="data.coverage"
                                                type="text"
                                                class="w-8rem"
                                            />
                                        </span>
                                    </template>
                                </Column>
                                <Column header="To a Maximum of">
                                    <template #body="{ data }">
                                        <span class="p-input-icon-left">
                                            <i class="pi pi-dollar" />
                                            <InputText
                                                v-model="data.max"
                                                type="text"
                                                class="w-8rem"
                                            />
                                        </span>
                                    </template>
                                </Column>
                                <Column
                                    field="coverage_restriction"
                                    header="Coverage Restriction"
                                >
                                    <template #body="{ data }">
                                        <span
                                            v-if="
                                                data.coverage_restriction ||
                                                readonly
                                            "
                                        >
                                            {{ data.coverage_restriction }}
                                        </span>
                                        <Button
                                            v-else
                                            label="Add"
                                            class="p-button-outlined w-full"
                                            @click="showCoverageDialog"
                                        />
                                    </template>
                                </Column>
                                <Column field="exclude">
                                    <template #header>
                                        <div class="text-center">Exclude</div>
                                    </template>
                                    <template #body>
                                        <div class="text-center">
                                            <Button
                                                size="small"
                                                icon="pi pi-minus"
                                                class="p-button-rounded p-button-outlined"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </BaseTable>
                        </div>
                    </TabPanel>
                    <TabPanel header="Excluded (0)">
                        <div class="mt-5">
                            <BaseTable
                                v-model:selection="selectedTableItems"
                                :value="tableItems"
                                :rows="10"
                                dataKey="id"
                                :rowHover="true"
                                :loading="loading"
                                paginator
                                removable-sort
                                responsiveLayout="scroll"
                            >
                                <template v-if="!readonly" #header>
                                    <div
                                        class="flex justify-content-between align-items-center"
                                    >
                                        <Button
                                            :label="`Bulk Action ${
                                                selectedTableItems.length
                                                    ? `(${
                                                          selectedTableItems.length +
                                                          1
                                                      } Selected)`
                                                    : ''
                                            }`"
                                            iconPos="right"
                                            icon="pi pi-chevron-down"
                                            class="ml-2 p-button-outlined"
                                            @click="showMenu"
                                        />
                                        <Menu
                                            :ref="`menu_${index}`"
                                            id="overlay_menu"
                                            :model="menuItems"
                                            :popup="true"
                                        />
                                        <span class="p-input-icon-left ml-4">
                                            <i class="pi pi-search" />
                                            <InputText
                                                v-model="searchText"
                                                placeholder="Search"
                                            />
                                        </span>
                                    </div>
                                </template>
                                <template #empty>
                                    <Label data-testid="empty-state-message">
                                        No services found.
                                    </Label>
                                </template>
                                <template #loading>
                                    Loading services. Please wait.
                                </template>

                                <Column
                                    v-if="!readonly"
                                    selectionMode="multiple"
                                    headerStyle="width: 3rem"
                                />
                                <Column sortable field="code" header="Code" />
                                <Column
                                    sortable
                                    field="description"
                                    header="Description"
                                >
                                </Column>
                                <Column header="Coverage">
                                    <template #body="{ data }">
                                        <span class="p-input-icon-right">
                                            <i class="pi pi-percentage" />
                                            <InputText
                                                v-model="data.coverage"
                                                type="text"
                                                class="w-8rem"
                                            />
                                        </span>
                                    </template>
                                </Column>
                                <Column header="To a Maximum of">
                                    <template #body="{ data }">
                                        <span class="p-input-icon-left">
                                            <i class="pi pi-dollar" />
                                            <InputText
                                                v-model="data.max"
                                                type="text"
                                                class="w-8rem"
                                            />
                                        </span>
                                    </template>
                                </Column>
                                <Column
                                    field="coverage_restriction"
                                    header="Coverage Restriction"
                                >
                                    <template #body="{ data }">
                                        <span
                                            v-if="
                                                data.coverage_restriction ||
                                                readonly
                                            "
                                        >
                                            {{ data.coverage_restriction }}
                                        </span>
                                        <Button
                                            v-else
                                            label="Add"
                                            class="p-button-outlined w-full"
                                            @click="showCoverageDialog"
                                        />
                                    </template>
                                </Column>
                                <Column field="exclude">
                                    <template #header>
                                        <div class="text-center">Exclude</div>
                                    </template>
                                    <template #body>
                                        <div class="text-center">
                                            <Button
                                                size="small"
                                                icon="pi pi-minus"
                                                class="p-button-rounded p-button-outlined"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </BaseTable>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </AccordionTab>
    </Accordion>
</template>

<style lang="scss" scoped></style>
