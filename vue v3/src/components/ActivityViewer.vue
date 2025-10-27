<script setup>
import { computed, watch, ref } from 'vue';
import { useActivityStore } from '@/stores/Activity';
import { useRoute } from 'vue-router';
import { useFeedStore } from '@/stores/Feed';
import ActivityHeader from '@/components/activities/ActivityHeader.vue';
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue';
import ActivityColumnView from '@/components/activities/ActivityColumnView.vue';

const props = defineProps({
    clientId: { type: [String, Number] }
});

const route = useRoute();
const module = computed(() => route.query.module);
const moduleId = computed(() => route.query.moduleId);
const activeTab = computed(() => route.query.tab || 'All');
const feedsState = ref({ loading: ref(false), data: ref(null) });

const { setCurrentModule } = useActivityStore();
const { getAllFeeds, setFilter } = useFeedStore();
const loading = computed(() => feedsState.value.loading.value);
const isFeedEmpty = computed(() => {
    return (
        feedsState.value.data?.today.length === 0 &&
        feedsState.value.data?.others.length === 0 &&
        feedsState.value.data?.pinned.length === 0
    );
});

watch(
    [module, moduleId, activeTab],
    ([newModule, newModuleId]) => {
        if (newModule && newModuleId) {
            setCurrentModule(newModule, newModuleId);

            const filters = [];

            if (activeTab.value === 'Communications')
                filters.push({
                    field: 'feedable_type',
                    operator: 'in',
                    value: ['chat', 'phone', 'email', 'text']
                });

            if (
                activeTab.value !== 'All' &&
                activeTab.value !== 'Communications'
            ) {
                let type = activeTab.value;
                if (type.endsWith('s')) {
                    type = type.slice(0, -1);
                }

                filters.push({ field: 'feedable_type', value: type });
            }
            setFilter(filters);

            feedsState.value = getAllFeeds(props.clientId, {
                filters,
                scopes: [
                    {
                        name: 'ForEntity',
                        parameters: [module.value, moduleId.value]
                    }
                ],
                sort: [
                    { field: 'is_pinned', direction: 'desc' },
                    { field: 'created_at', direction: 'desc' }
                ],
                includes: ['entities']
            });
        }
    },
    { immediate: true } // Optional: run right away if already defined
);
</script>

<template>
    <ActivityHeader :clientId="clientId" />

    <ActivityFilterBar :clientId="clientId" />

    <div v-if="!loading">
        <ActivityColumnView :clientId="clientId" :activeTab="activeTab" />
    </div>

    <div v-if="isFeedEmpty" class="flex flex-col">
        <div class="flex justify-content-center align-items-center h-full">
            <span class="text-gray-500 text-2xl p-6 text-center">{{
                $t('activities.no_activities_found', {
                    activity: activeTab === 'All' ? 'Activities' : activeTab
                })
            }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
