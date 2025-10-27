<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
    useRoleStore,
    useRoleUserStore
} from '@/modules/administration/stores';
import useEventsBus from '@/composables/event-bus';
import UserTable from '@/modules/administration/components/roles/tables/UserTable.vue';

const { t } = useI18n();
const { emit } = useEventsBus();
const roleStore = useRoleStore();
const route = useRoute();
const roleUserStore = useRoleUserStore();
const includedCount = ref(null);
const excludedCount = ref(null);
const entityId = ref(route.params.id);

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', roleStore.currentRole?.name || '');
    await getItems();
});

const getItems = async () => {
    const res = await roleUserStore.searchUsers(
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
                    <UserTable
                        action="included"
                        :entity_id="entityId"
                        @reloadUsers="getItems"
                    />
                </TabPanel>
                <TabPanel
                    :header="`${t('scopes.excluded')} (${excludedCount})`"
                >
                    <UserTable
                        action="excluded"
                        :entity_id="entityId"
                        @reloadUsers="getItems"
                    />
                </TabPanel>
            </TabView>
        </template>
    </Card>
</template>
