<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onBeforeMount } from 'vue';
import { useRoleStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const roleStore = useRoleStore();
const roleId = ref(route.params.id);
const loading = ref(false);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!roleId.value) return [];
    return [
        {
            label: t('common.permissions'),
            to: { name: 'RolePermissions', params: { id: roleId.value } }
        },
        {
            label: t('common.teams'),
            to: { name: 'RoleTeams', params: { id: roleId.value } }
        },
        {
            label: t('common.users'),
            to: { name: 'RoleUsers', params: { id: roleId.value } }
        }
    ];
});

const goBack = () => {
    router.push({ name: 'Roles' });
};

const getItem = async () => {
    if (!roleId.value) return;
    try {
        loading.value = true;
        const res = await roleStore.getRole(roleId.value);
        roleStore.setCurrentRole(res.data);
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
                @click="goBack"
                data-testid="back-button"
                icon="pi pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        roleStore.currentRole?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-4 mb-5">
            <TabMenu :model="tabItems" data-testid="roles-menu-tabs" />
        </div>
        <router-view />
    </div>
</template>
