<script setup>
import { ref, computed, useSlots } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const slots = useSlots();
const slotNames = Object.keys(slots);

const props = defineProps({
    value: {
        type: Array,
        default: () => []
    },
    lazy: {
        type: Boolean,
        default: true
    },
    dataKey: {
        type: String,
        default: 'id'
    },
    rowHover: {
        type: Boolean,
        default: true
    },
    stripedRows: {
        type: Boolean,
        default: true
    },
    paginator: {
        type: Boolean,
        default: true
    },
    removableSort: {
        type: Boolean,
        default: true
    },
    responsiveLayout: {
        type: String,
        default: 'scroll'
    },
    page: {
        type: Number,
        default: 1
    },
    rows: {
        type: Number,
        default: 10
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    rowsPerPageOptions: {
        type: Array,
        default: () => [10, 15, 20, 30, 50]
    }
});

const localPage = ref(1);
const localRows = ref(props.rows);

const pageTemplate = computed(() => {
    let from = 0;
    let to = 0;
    if (props.lazy) {
        from = props.page * props.rows - props.rows + 1;
        const temp = props.page * props.rows;
        to = temp > props.totalRecords ? props.totalRecords : temp;
    } else {
        from = localPage.value * localRows.value - localRows.value + 1;
        const temp = localPage.value * localRows.value;
        to = temp > props.value.length ? props.value.length : temp;
    }

    return `${t('common.showing')} ${from} ${t('common.to')} ${to} ${t(
        'common.of'
    )} {totalRecords} ${t('common.entries')}`;
});

const onPageChange = (event) => {
    if (!props.lazy) {
        localPage.value = event.page + 1;
        localRows.value = event.rows;
    }
};
</script>

<template>
    <DataTable
        v-bind="$attrs"
        :lazy="lazy"
        :value="value"
        :data-key="dataKey"
        :rowHover="rowHover"
        :stripedRows="stripedRows"
        :paginator="paginator"
        :removable-sort="removableSort"
        :responsive-layout="responsiveLayout"
        :first="page * rows - rows"
        :rows="rows"
        :total-records="totalRecords"
        :rowsPerPageOptions="rowsPerPageOptions"
        :currentPageReportTemplate="totalRecords > 0 ? pageTemplate : ''"
        :paginatorTemplate="totalRecords > 0 ? `CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown` : ''"
        @page="onPageChange"
    >
        <template
            v-for="(name, index) of slotNames"
            :key="index"
            #[name]="slotProps"
        >
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
    </DataTable>
</template>

<style lang="scss" scoped></style>
