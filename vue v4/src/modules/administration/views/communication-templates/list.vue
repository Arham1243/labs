<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CommunicationTemplateTable from '@/modules/administration/components/communication-templates/CommunicationTemplateTable.vue';

const { t } = useI18n();
const router = useRouter();

const pushRoute = (name) => {
    router.push({ name });
};
</script>

<template>
    <div>
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="pushRoute('Administration')"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <div class="w-full">
                <Header hide-back>
                    <template #title>
                        <span data-testid="page-title">{{
                            t('communication_templates.title')
                        }}</span>
                    </template>
                    <template #actions>
                        <Button
                            data-testid="add-new-communication-template-button"
                            :label="t('communication_templates.new_template')"
                            @click="pushRoute('New Communication Template')"
                            icon="pi pi-plus"
                            v-if="$ability.can('create announcements')"
                        />
                    </template>
                </Header>
            </div>
        </div>
        <Card class="mt-6">
            <template #content>
                <CommunicationTemplateTable />
            </template>
        </Card>
    </div>
</template>
