<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AdjudicationDetailsForm from '@/modules/claims/components/adjudication/AdjudicationDetailsForm.vue';

const { t } = useI18n();
const route = useRoute();
const form = defineModel('form', { default: null });
</script>
<template>
    <div class="grid grid-cols-12 my-20">
        <div class="col-span-8 col-start-3">
            <Card>
                <template #content>
                    <h5
                        class="mb-4"
                        v-text="t('adjudication.details')"
                        data-testid="text-details-title"
                    />
                    <AdjudicationDetailsForm ref="form" :queueId="route.query?.id" />
                </template>
            </Card>
        </div>
    </div>
</template>
