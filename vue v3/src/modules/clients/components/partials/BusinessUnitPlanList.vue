<script setup>
import { usePlanStore } from '@/modules/plans/stores/Plan';

import BusinessUnitPlan from './BusinessUnitPlan.vue';
import { onMounted, ref, watch } from 'vue';
import useEventsBus from '@/composables/event-bus';

const planStore = usePlanStore();

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['hasPlans']);
const { bus } = useEventsBus();

const plans = ref([]);
const isLoading = ref(false);

watch(
    () => bus.value.get('reloadPlans'),
    async () => {
        await getPlans();
    }
);

onMounted(() => {
    getPlans();
});

const getPlans = async () => {
    try {
        isLoading.value = true;
        const res = await planStore.searchPlanByBusinessUnitUuids({
            business_unit_ids: [props.id]
        });
        plans.value = res.data;

        emit('hasPlans', plans.value.length > 0);
    } finally {
        isLoading.value = false;
    }
};
</script>
<template>
    <div>
        <BusinessUnitPlan
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            @reloadPlans="getPlans()"
        />
    </div>
</template>
