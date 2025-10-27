<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ClientSectorTable from '@/modules/administration/components/client/tables/ClientSectorTable.vue';

const router = useRouter();
const { t } = useI18n();
const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        t('client_sector.title')
                    }}</span></template
                >
            </Header>
        </div>

 <Card class="mt-6">
            <template #content>
                <ClientSectorTable />
            </template>
        </Card>
    </div>
</template>
