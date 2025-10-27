<script setup>
import { ref } from 'vue';

const searchText = ref('');
const loading = ref(false);

const items = ref([
    {
        id: 1000,
        code: 'A00',
        description:
            'Blood glucose test or reagent strips for home blood glucose monitor, per 50 strips'
    },
    {
        id: 1001,
        code: 'A01',
        description: 'Platforms for home blood glucose monitor, 50 per box'
    },
    {
        id: 1002,
        code: 'A02',
        description: 'Normal, low and high calibrator solution / chips'
    },
    {
        id: 1003,
        code: 'A03',
        description:
            'Replacement lens shield cartridge for use with laser skin piercing device, each'
    },
    {
        id: 1004,
        code: 'A04',
        description: 'Spring-powered device for lancet, each'
    },
    {
        id: 1005,
        code: 'A05',
        description: 'Lancets, per box of 100'
    }
]);
</script>

<template>
    <DataTable
        :value="items"
        :rows="10"
        dataKey="id"
        :rowHover="true"
        :loading="loading"
        paginator
        removable-sort
        responsiveLayout="scroll"
    >
        <template #header>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchText" placeholder="Search" />
            </span>
        </template>
        <template #empty>
            <Label data-testid="empty-state-message">
                No services found.
            </Label>
        </template>
        <template #loading> Loading services. Please wait. </template>

        <Column sortable field="code" header="Code"> </Column>
        <Column field="description" header="Description"> </Column>
    </DataTable>
</template>

<style lang="scss" scoped></style>
