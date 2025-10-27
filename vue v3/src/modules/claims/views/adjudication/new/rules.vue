<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AdjudicationRulesForm from '@/modules/claims/components/adjudication/AdjudicationRulesForm.vue';

const { t } = useI18n();
const route = useRoute();
const form = defineModel('form', { default: null });
</script>
<template>
    <div class="card col-8 mx-auto mb-0 pb-4">
        <h5
            class="p-3 w-full"
            v-text="t('adjudication.rules_title')"
            data-testid="text-rules-title"
        />

        <AdjudicationRulesForm ref="form" :queueId="route.query?.id" />
    </div>
</template>
