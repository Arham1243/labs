<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useEditState } from '@/modules/plans/composables/useEditState';
import PlanBenefitGroupsTable from '../tables/PlanBenefitGroupsTable.vue';

const props = defineProps({
    benefitGroup: {
        type: Object,
        required: true
    },
    isEditable: {
        type: Boolean,
        required: false,
        default: false
    },
    store: {
        type: Object,
        required: true
    }
});

const { setupNestedTabProtection } = useEditState();

const countIncludes = ref(props.benefitGroup.included_benefits_count);
const countExcludes = ref(props.benefitGroup.excluded_benefits_count);

const nestedTabGroupId = computed(() => {
    const id = `nested-tab-${props.benefitGroup?.pivot?.id}`;
    return id;
});

const setCountIncludes = (value) => {
    countIncludes.value = value;
};

const setCountExcludes = (value) => {
    countExcludes.value = value;
};

const updateCounts = (isInclude) => {
    if (isInclude) {
        countIncludes.value = countIncludes.value - 1;
        countExcludes.value = countExcludes.value + 1;
    } else {
        countIncludes.value = countIncludes.value + 1;
        countExcludes.value = countExcludes.value - 1;
    }
};

let cleanupNestedTabs = null;
onMounted(() => {
    cleanupNestedTabs = setupNestedTabProtection(nestedTabGroupId.value);
    setTimeout(() => {
        const container = document.querySelector(
            `[data-nested-tab="${nestedTabGroupId.value}"]`
        );
        if (container) {
            const nestedTabs = container.querySelectorAll('.p-tabview-nav li');
            nestedTabs.forEach((tab, index) => {});
        }
    }, 200);
});

onUnmounted(() => {
    if (cleanupNestedTabs) {
        cleanupNestedTabs();
    }
});
</script>
<template>
    <div class="m-0" :data-nested-tab="nestedTabGroupId">
        <Tabs :key="benefitGroup?.pivot?.id" :lazy="true" value="0">
            <TabList>
                <Tab value="0">{{ `${$t('common.included')} (${countIncludes})` }}</Tab>
                <Tab value="1">{{ `${$t('common.excluded')} (${countExcludes})` }}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <PlanBenefitGroupsTable
                        :id="benefitGroup?.pivot?.id"
                        :is-editable="isEditable"
                        :is-included="true"
                        :store="store"
                        :benefit-group="benefitGroup"
                        @set-count-includes="setCountIncludes"
                        @update-counts="updateCounts"
                    />
                </TabPanel>
                <TabPanel value="1">
                    <PlanBenefitGroupsTable
                        :id="benefitGroup?.pivot?.id"
                        :is-editable="isEditable"
                        :store="store"
                        @set-count-excludes="setCountExcludes"
                        @update-counts="updateCounts"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
