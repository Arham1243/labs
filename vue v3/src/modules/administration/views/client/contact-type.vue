<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import ContactTypeTable from '@/modules/administration/components/client/tables/ContactTypeTable.vue';
const { t } = useI18n();
const router = useRouter();

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
                        t('contact_type.title')
                    }}</span></template
                >
            </Header>
        </div>
        <Card class="mt-4">
            <template #content>
                <ContactTypeTable />
            </template>
        </Card>
    </div>
</template>
