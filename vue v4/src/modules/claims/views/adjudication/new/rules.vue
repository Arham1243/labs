<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AdjudicationRulesForm from '@/modules/claims/components/adjudication/AdjudicationRulesForm.vue';

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
                        class="w-full mb-4"
                        v-text="t('adjudication.rules_title')"
                        data-testid="text-rules-title"
                    />
                    <AdjudicationRulesForm ref="form" :queueId="route.query?.id" />
                </template>
            </Card>
        </div>
    </div>
</template>
