<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
    useUserStore,
    useUserRoleStore
} from '@/modules/administration/stores';
import useEventsBus from '@/composables/event-bus';
import RoleTable from '@/modules/administration/components/users/tables/RoleTable.vue';

const { t } = useI18n();
const { emit } = useEventsBus();
const userStore = useUserStore();
const route = useRoute();
const userRoleStore = useUserRoleStore();
const includedCount = ref(null);
const excludedCount = ref(null);
const entityId = ref(route.params.id);

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', userStore.currentUser?.name || '');
    await getItems();
});

const getItems = async () => {
    const res = await userRoleStore.searchRoles(
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
                        <RoleTable
                            action="included"
                            :entity_id="entityId"
                            @reloadRoles="getItems"
                        />
                    </TabPanel>
                    <TabPanel value="excluded">
                        <RoleTable
                            action="excluded"
                            :entity_id="entityId"
                            @reloadRoles="getItems"
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </template>
    </Card>
</template>
