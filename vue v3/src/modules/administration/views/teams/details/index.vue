<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTeamStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const teamStore = useTeamStore();
const loading = ref(false);
const teamId = ref(route.params.id);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!teamId.value) return [];
    const tabs = [
        {
            label: t('common.users'),
            to: { name: 'TeamUsers', params: { id: teamId.value } }
        },
        {
            label: t('common.roles'),
            to: { name: 'TeamRoles', params: { id: teamId.value } }
        }
    ];

    if (teamStore.currentTeam?.type === 'company') {
        tabs.push({
            label: t('scopes.title'),
            to: { name: 'TeamScopes', params: { id: teamId.value } }
        });
    }

    return tabs;
});

const goBack = () => {
    router.push({ name: 'Teams' });
};

const getItem = async () => {
    try {
        loading.value = true;
        const res = await teamStore.getTeam(teamId.value);
        teamStore.setCurrentTeam(res.data);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex align-items-center gap-4">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        teamStore.currentTeam?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-4 mb-3 pb-1">
            <TabMenu :model="tabItems" data-testid="teams-menu-tabs" />
        </div>
        <router-view />
    </div>
</template>
