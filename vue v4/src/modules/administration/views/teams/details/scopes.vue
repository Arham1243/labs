<script setup>
import { onBeforeMount, ref } from 'vue';
import { useTeamStore } from '@/modules/administration/stores';
import { useRoute } from 'vue-router';
import { useScopeStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';
import ScopeTable from '@/modules/administration/components/tables/ScopeTable.vue';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

const { t } = useI18n();
const { emit } = useEventsBus();
const route = useRoute();
const scopeStore = useScopeStore();
const teamStore = useTeamStore();
const includedCount = ref(null);
const excludedCount = ref(null);
const entityId = ref(route.params.id);

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', teamStore.currentTeam?.name || '');
    await getScopes();
});

const getScopes = async () => {
    const res = await scopeStore.search('teams', entityId.value, 'included');
    includedCount.value = res.included_count;
    excludedCount.value = res.excluded_count;
};
</script>

<template>
    <Loader v-if="includedCount === null && excludedCount === null" />
    <Card v-else>
        <template #content>
            <Tabs :lazy="true" value="0">
                <TabList>
                    <Tab value="0">{{ `${t('scopes.included')} (${includedCount})` }}</Tab>
                    <Tab value="1">{{ `${t('scopes.excluded')} (${excludedCount})` }}</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <ScopeTable
                            action="included"
                            entity="teams"
                            :entity_id="entityId"
                            @reloadScopes="getScopes"
                        />
                    </TabPanel>
                    <TabPanel value="1">
                        <ScopeTable
                            action="excluded"
                            entity="teams"
                            :entity_id="entityId"
                            @reloadScopes="getScopes"
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </template>
    </Card>
</template>
