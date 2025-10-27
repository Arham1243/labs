<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AdjudicationDetailsForm from '@/modules/claims/components/adjudication/AdjudicationDetailsForm.vue';

const { t } = useI18n();
const route = useRoute();
const form = defineModel('form', { default: null });
</script>
<template>
    <div class="card col-8 mx-auto flex mb-0 flex-wrap">
        <h5
            class="p-3"
            v-text="t('adjudication.details')"
            data-testid="text-details-title"
        />

        <AdjudicationDetailsForm ref="form" :queueId="route.query?.id" />
    </div>
</template>
