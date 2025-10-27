<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AnnouncementTable from '@/modules/administration/components/announcements/AnnouncementTable.vue';

const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex align-items-center gap-6 mb-6 custom-button-header-action">
            <Button
            data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title>
                    <span data-testid="page-title">{{
                        t('announcements.title')
                    }}</span>
                </template>
            </Header>
        </div>
        <Card>
            <template #content>
                <AnnouncementTable />
            </template>
        </Card>
    </div>
</template>
