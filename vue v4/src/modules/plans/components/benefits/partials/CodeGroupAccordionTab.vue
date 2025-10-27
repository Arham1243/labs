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
    <Tabs value="0" :lazy="true">
        <TabList>
            <Tab value="0">{{ `${$t('common.included')} (${countIncludes})` }}</Tab>
            <Tab value="1">{{ `${$t('common.excluded')} (${countExcludes})` }}</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <CodeGroupServicesTable
                    :id="props.codeSetGroup.pivot.id"
                    :is-editable="isEditable"
                    :is-included="true"
                    @set-count-includes="setCountIncludes"
                    @update-counts="updateCounts"
                />
            </TabPanel>
            <TabPanel value="1">
                <CodeGroupServicesTable
                    :id="props.codeSetGroup.pivot.id"
                    :is-editable="isEditable"
                    :is-included="false"
                    @set-count-excludes="setCountExcludes"
                    @update-counts="updateCounts"
                />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
