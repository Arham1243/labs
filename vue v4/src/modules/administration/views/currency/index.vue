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
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title>
                    <Label test-id="page-title">
                        {{ t('common.currency') }}</Label
                    >
                </template>
            </Header>
        </div>
 <Card class="mt-6">
            <template #content>
                <CurrencyTable />
            </template>
        </Card>
    </div>
</template>
