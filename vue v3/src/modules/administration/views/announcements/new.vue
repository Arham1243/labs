<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AnnouncementForm from '@/modules/administration/components/announcements/AnnouncementForm.vue';

const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Announcement' });
};
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
                        t('announcements.title')
                    }}</span>
                </template>
            </Header>
        </div>
        <AnnouncementForm mode="new" />
    </div>
</template>
