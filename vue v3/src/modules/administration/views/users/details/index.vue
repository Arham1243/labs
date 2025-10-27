<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onBeforeMount, computed } from 'vue';
import { useUserStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const userId = ref(route.params.id);

onBeforeMount(async () => {
    await getItem();
});

const tabItems = computed(() => {
    if (!userId.value) return [];
    const tabs = [
        {
            label: t('common.teams'),
            to: { name: 'User Teams', params: { id: userId.value } }
        },
        {
            label: t('common.roles'),
            to: { name: 'User Roles', params: { id: userId.value } }
        }
    ];

    if (userStore.currentUser?.type === 'company') {
        tabs.push({
            label: t('scopes.title'),
            to: { name: 'User Scopes', params: { id: userId.value } }
        });
    }

    return tabs;
});

const goBack = () => {
    router.push({ name: 'Users' });
};

const getItem = async () => {
    if (!userId.value) return;
    try {
        loading.value = true;
        const res = await userStore.getUser(userId.value);
        userStore.setCurrentUser(res?.data);
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
                        userStore.currentUser?.name || ''
                    }}</span></template
                >
            </Header>
        </div>
        <div class="mt-4 mb-5" v-if="tabItems.length">
            <TabMenu :model="tabItems" data-testid="roles-menu-tabs" />
        </div>
        <router-view />
    </div>
</template>
