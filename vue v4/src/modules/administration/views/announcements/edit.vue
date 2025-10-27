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
        <AnnouncementForm mode="edit" />
    </div>
</template>
