<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useHelpers } from '@/composables';

const helpers = useHelpers();
const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Administration' });
};

const allTabItems = [
    {
        label: t('settings.date_time'),
        to: { name: 'Settings' },
        permission: 'update settings'
    },
    {
        label: t('common.currency'),
        to: { name: 'Currency Settings' },
        permission: 'update settings'
    }
];

const tabItems = computed(() => {
    return helpers.filterByPermission(allTabItems);
});
</script>

<template>
    <div>
        <div class="flex align-items-center gap-4 mb-4">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title>
                    <span data-testid="page-title">{{
                        t('settings.title')
                    }}</span>
                </template>
            </Header>
        </div>
        <TabMenu :model="tabItems" data-testid="settings-tabs" />
        <router-view />
    </div>
</template>
