<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
    useRoleStore,
    useRoleTeamStore
} from '@/modules/administration/stores';
import useEventsBus from '@/composables/event-bus';
import TeamTable from '@/modules/administration/components/roles/tables/TeamTable.vue';

const { t } = useI18n();
const { emit } = useEventsBus();
const roleStore = useRoleStore();
const route = useRoute();
const roleTeamStore = useRoleTeamStore();
const includedCount = ref(null);
const excludedCount = ref(null);
const entityId = ref(route.params.id);

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', roleStore.currentRole?.name || '');
    await getItems();
});

const getItems = async () => {
    const res = await roleTeamStore.searchTeams(
        entityId.value,
        'excluded',
        {},
        {}
    );
    includedCount.value = res.included_count;
    excludedCount.value = res.excluded_count;
};
</script>

<template>
    <Loader v-if="includedCount === null || excludedCount === null" />
    <Card v-else>
        <template #content>
            <Tabs value="included" lazy>
                <TabList>
                    <Tab value="included">
                        {{ t('scopes.included') }} ({{ includedCount }})
                    </Tab>
                    <Tab value="excluded">
                        {{ t('scopes.excluded') }} ({{ excludedCount }})
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="included">
                        <TeamTable
                            action="included"
                            :entity_id="entityId"
                            @reloadTeams="getItems"
                        />
                    </TabPanel>
                    <TabPanel value="excluded">
                        <TeamTable
                            action="excluded"
                            :entity_id="entityId"
                            @reloadTeams="getItems"
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </template>
    </Card>
</template>
