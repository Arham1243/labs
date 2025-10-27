<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CommunicationTemplateForm from '@/modules/administration/components/communication-templates/CommunicationTemplateForm.vue';

const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Communication Templates' });
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
                        t('communication_templates.title')
                    }}</span>
                </template>
            </Header>
        </div>
        <CommunicationTemplateForm mode="edit" />
    </div>
</template>
