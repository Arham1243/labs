<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CurrencyTable from '@/modules/administration/components/CurrencyTable.vue';
const { t } = useI18n();
const router = useRouter();
import Label from '@/components/common/Label.vue';

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
                <template #title>
                    <Label test-id="page-title">
                        {{ t('common.currency') }}</Label
                    >
                </template>
            </Header>
        </div>
        <Card class="mt-4">
            <template #content>
                <CurrencyTable />
            </template>
        </Card>
    </div>
</template>
