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
            <TabView :lazy="true">
                <TabPanel
                    :header="`${t('scopes.included')} (${includedCount})`"
                >
                    <TeamTable
                        action="included"
                        :entity_id="entityId"
                        @reloadTeams="getItems"
                    />
                </TabPanel>
                <TabPanel
                    :header="`${t('scopes.excluded')} (${excludedCount})`"
                >
                    <TeamTable
                        action="excluded"
                        :entity_id="entityId"
                        @reloadTeams="getItems"
                    />
                </TabPanel>
            </TabView>
        </template>
    </Card>
</template>
