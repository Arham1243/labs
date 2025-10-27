<script setup>
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '@/stores';
import { useExpenseStore } from '@/modules/claims/stores/Expense';

const { t } = useI18n();
const route = useRoute();
const globalStore = useGlobalStore();
const user = inject('currentUser');
const diagnosisRecommendationMenu = ref();
const showDiagnosisInput = ref(true);

const { currentExpense, updateExpense } = useExpenseStore();
const { mutate } = updateExpense();

// Diagnosis recommendation dropdown menu items
const diagnosisRecommendation = ref([
    {
        items: [
            {
                label: 'Diagnosis 1',
                value: 'Diagnosis 1',
                command: () =>
                    updateDiagnosis({
                        diagnosis: 'Diagnosis 1',
                        user_id: user.value?.id
                    })
            },
            {
                label: 'Diagnosis 2',
                value: 'Diagnosis 2',
                command: () =>
                    updateDiagnosis({
                        diagnosis: 'Diagnosis 2',
                        user_id: user.value?.id
                    })
            }
        ]
    }
]);

/**
 * Show diagnosis recommendation dropdown menu
 * @param event
 */
const showDiagnosisRecommendation = (event) => {
    diagnosisRecommendationMenu.value.toggle(event);
};

/**
 * Update expense diagnosis
 * @param payload
 * @returns {Promise<void>}
 */
const updateDiagnosis = async (payload) => {
    try {
        await mutate({
            tenantId: route.params.clientId,
            expenseId: currentExpense.value.id,
            formData: payload
        });

        // Show success notification
        globalStore.showSuccess(
            t('notifications.diagnosis_changed'),
            t('notifications.diagnosis_updated')
        );
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <Card class="mt-4">
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <p class="font-semibold" data-testid="title-diagnosis">
                        <span
                            class="p-button-icon pi pi-chevron-down pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-diagnosis"
                            v-if="showDiagnosisInput"
                            @click="showDiagnosisInput = !showDiagnosisInput"
                        ></span>
                        <span
                            class="p-button-icon pi pi-chevron-right pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-diagnosis"
                            v-else
                            @click="showDiagnosisInput = !showDiagnosisInput"
                        ></span>
                        {{ $t('expenses.diagnosis') }}
                    </p>
                </div>
            </div>
        </template>
        <template #content v-if="showDiagnosisInput">
            <div class="grid mt-4 p-fluid formgrid">
                <div class="field col-12" data-testid="input-diagnosis">
                    <InputText
                        id="diagnosis"
                        @click="showDiagnosisRecommendation"
                        placeholder="Enter a Diagnosis...."
                        :value="currentExpense.diagnosis"
                        :disabled="currentExpense.status === 'declined'"
                    />
                    <Menu
                        ref="diagnosisRecommendationMenu"
                        id="diagnosis_menu"
                        :model="diagnosisRecommendation"
                        :popup="true"
                        class="w-25rem"
                        data-testid="menu-diagnosis-recommendation"
                    >
                        <template #start>
                            <div
                                class="flex align-content-between pl-2 pt-3 pb-0 gap-2"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M15.8333 7.50016L16.8749 5.2085L19.1666 4.16683L16.8749 3.12516L15.8333 0.833496L14.7916 3.12516L12.4999 4.16683L14.7916 5.2085L15.8333 7.50016ZM9.58325 7.91683L7.49992 3.3335L5.41658 7.91683L0.833252 10.0002L5.41658 12.0835L7.49992 16.6668L9.58325 12.0835L14.1666 10.0002L9.58325 7.91683ZM15.8333 12.5002L14.7916 14.7918L12.4999 15.8335L14.7916 16.8752L15.8333 19.1668L16.8749 16.8752L19.1666 15.8335L16.8749 14.7918L15.8333 12.5002Z"
                                        fill="#212121"
                                    />
                                </svg>
                                <p>Recommendations</p>
                            </div>
                        </template>
                    </Menu>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss"></style>
