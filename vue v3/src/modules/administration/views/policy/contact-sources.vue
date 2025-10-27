<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ContactSourceTable from '@/modules/administration/components/policy/tables/ContactSourceTable.vue';

const router = useRouter();
const { t } = useI18n();
const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex align-items-center gap-4">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        t('contact_sources.title')
                    }}</span></template
                >
            </Header>
        </div>

        <Card class="mt-4">
            <template #content>
                <ContactSourceTable />
            </template>
        </Card>
    </div>
</template>
