<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useHelpers } from '@/composables';

const helpers = useHelpers();
const { t } = useI18n();
const router = useRouter();
import Label from '@/components/common/Label.vue';

const goBack = () => {
    router.push({ name: 'Administration' });
};

const allTabItems = [
    {
        label: t('country.country'),
        to: { name: 'Country/Regions' },
        permission: 'view countries'
    },
    {
        label: t('country.region'),
        to: { name: 'Region' },
        permission: 'view regions'
    },
    {
        label: t('country.province_state'),
        to: { name: 'Province' },
        permission: 'view provinces'
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
                    <Label test-id="page-title">{{ t('country.title') }}</Label>
                </template>
            </Header>
        </div>
        <TabMenu :model="tabItems" data-testid="country-menu-tabs" />
        <router-view />
    </div>
</template>
