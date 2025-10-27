<script setup>
import CodeGroupServicesTable from '@/modules/plans/components/benefits/tables/CodeGroupServicesTable.vue';
import { ref } from 'vue';

const props = defineProps({
    codeSetGroup: {
        type: Object,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    }
});

const countIncludes = ref(props.codeSetGroup.included_service_codes_count);
const countExcludes = ref(props.codeSetGroup.excluded_service_codes_count);

const setCountIncludes = (value) => {
    countIncludes.value = value;
};

const setCountExcludes = (value) => {
    countExcludes.value = value;
};

const updateCounts = (isInclude, num = 1) => {
    if (isInclude) {
        countIncludes.value = countIncludes.value - num;
        countExcludes.value = countExcludes.value + num;
    } else {
        countIncludes.value = countIncludes.value + num;
        countExcludes.value = countExcludes.value - num;
    }
};
</script>
<template>
    <TabView :lazy="true">
        <TabPanel>
            <template #header>
                {{ `${$t('common.included')} (${countIncludes})` }}
            </template>
            <CodeGroupServicesTable
                :id="props.codeSetGroup.pivot.id"
                :is-editable="isEditable"
                :is-included="true"
                @set-count-includes="setCountIncludes"
                @update-counts="updateCounts"
            />
        </TabPanel>
        <TabPanel>
            <template #header>
                {{ `${$t('common.excluded')} (${countExcludes})` }}
            </template>
            <CodeGroupServicesTable
                :id="props.codeSetGroup.pivot.id"
                :is-editable="isEditable"
                :is-included="false"
                @set-count-excludes="setCountExcludes"
                @update-counts="updateCounts"
            />
        </TabPanel>
    </TabView>
</template>
