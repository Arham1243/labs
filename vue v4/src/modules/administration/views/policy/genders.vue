<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GenderTable from '@/modules/administration/components/policy/tables/GenderTable.vue';

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
                        t('genders.title')
                    }}</span></template
                >
            </Header>
        </div>

 <Card class="mt-6">
            <template #content>
                <GenderTable />
            </template>
        </Card>
    </div>
</template>
