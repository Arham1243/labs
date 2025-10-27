<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useScopeStore, useUserStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';
import ScopeTable from '@/modules/administration/components/tables/ScopeTable.vue';

const { t } = useI18n();
const { emit } = useEventsBus();
const scopeStore = useScopeStore();
const route = useRoute();
const userStore = useUserStore();
const includedCount = ref(null);
const excludedCount = ref(null);
const entityId = ref(route.params.id);

onBeforeMount(async () => {
    emit('updateDetailsBreadcrumb', userStore.currentUser?.name || '');
    await getScopes();
});

const getScopes = async () => {
    const res = await scopeStore.search(
        'company-users',
        entityId.value,
        'included'
    );
    includedCount.value = res.included_count;
    excludedCount.value = res.excluded_count;
};
</script>

<template>
    <Loader v-if="includedCount === null && excludedCount === null" />
    <Card v-else>
        <template #content>
            <TabView :lazy="true">
                <TabPanel
                    :header="`${t('scopes.included')} (${includedCount})`"
                >
                    <ScopeTable
                        action="included"
                        entity="company-users"
                        :entity_id="entityId"
                        @reloadScopes="getScopes"
                    />
                </TabPanel>
                <TabPanel
                    :header="`${t('scopes.excluded')} (${excludedCount})`"
                >
                    <ScopeTable
                        action="excluded"
                        entity="company-users"
                        :entity_id="entityId"
                        @reloadScopes="getScopes"
                    />
                </TabPanel>
            </TabView>
        </template>
    </Card>
</template>
