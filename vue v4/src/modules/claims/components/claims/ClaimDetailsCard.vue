<script setup>
import { onMounted, ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import ActivityViewer from '@/components/ActivityViewer.vue';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import SubmissionClaimTable from '@/modules/claims/components/submissions/SubmissionClaimTable.vue';
import ReservedAmountDialog from '@/modules/claims/components/claims/dialogs/ReservedAmountDialog.vue';
import ClaimMeterReservedAmount from '@/modules/claims/components/claims/ClaimMeterReservedAmount.vue';
import AuditTable from '@/components/common/AuditTable.vue';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();

// Show Reserved Amount Dialog
const showDialog = ref(false);

const showTable = ref(true);
const activeTab = ref(0);
const { currentClaim } = useClaimStore();
const emits = defineEmits(['scrollToClaimsTab']);

// Watch for tab change
watch(activeTab, (newVal) => {
    if (newVal === 1) {
        // Only set query when activity tab is selected
        router.replace({
            query: {
                ...route.query,
                module: 'claim',
                moduleId: currentClaim.value.id
            }
        });
    } else {
        // Optional: clean up module/moduleId from query when leaving Activity tab
        const { module, moduleId, tab, ...rest } = route.query;
        router.replace({
            query: rest
        });
    }
});

onMounted(() => {
    const { module, moduleId } = route.query;

    if (module && moduleId) {
        activeTab.value = 1; // Activities tab
    }
});
</script>

<template>
    <Card v-if="currentClaim?.id">
        <template #content>
            <div>
                <div class="flex items-start gap-2">
                    <Button
                        text
                        :icon="
                            'pi ' +
                            (showTable ? 'pi-chevron-down' : 'pi-chevron-right')
                        "
                        @click="showTable = !showTable"
                        data-testid="btn-toggle-claim-table"
                    />
                    <div class="grow">
                        <div
                            class="flex gap-12 items-start justify-between"
                        >
                            <div class="mb-5">
                                <div class="flex gap-5">
                                    <h5 class="mb-2">
                                        {{ $t('claims.claim_id') }}
                                        <span
                                            data-testid="text-claim-number"
                                            v-text="currentClaim.ref_number"
                                        />
                                    </h5>
                                    <div class="flex gap-2 items-start">
                                        <ClaimStatusTag
                                            :status="currentClaim.status"
                                            data-testid="tag-claim-status"
                                        />
                                        <ClaimStatusTag
                                            :status="'high priority'"
                                            data-testid="tag-claim-priority-status"
                                        />
                                    </div>
                                </div>
                                <div
                                    class="flex justify-between gap-2"
                                    data-testid="text-submission-receiveDate-source"
                                >
                                    {{ $t('claims.last_updated') }}
                                    {{
                                        helpers.formatDate(
                                            currentClaim.created_at,
                                            'DD-MMM-YYYY'
                                        )
                                    }}
                                </div>
                            </div>
<!--                            <Button-->
<!--                                label="Review Complete"-->
<!--                                icon="pi pi-check"-->
<!--                                data-testid="btn-review-complete"-->
<!--                            />-->
                        </div>

                        <ClaimMeterReservedAmount
                            :claim="currentClaim"
                            v-model:showDialog="showDialog"
                        />
                    </div>
                </div>

                <ReservedAmountDialog
                    :claim="currentClaim"
                    v-model:visible="showDialog"
                />

                <!-- Tabs converted to PrimeVue 4 -->
                <Tabs
                    v-if="showTable"
                    :lazy="true"
                    v-model:value="activeTab"
                    class="mt-2"
                    data-testid="tabview-expenses-documents"
                >
                    <TabList>
                        <Tab :value="0">
                            <div
                                class="leading-normal flex gap-2 items-center"
                            >
                                <i class="pi pi-list" />
                                <span
                                    data-testid="tab-expenses"
                                    v-text="$t('submissions.title')"
                                />
                            </div>
                        </Tab>
                        <Tab :value="1">
                            <div
                                class="leading-normal flex gap-2 items-center"
                            >
                                <i class="pi pi-folder" />
                                <span
                                    data-testid="tab-activities"
                                    v-text="$t('activities.title')"
                                />
                            </div>
                        </Tab>
                        <Tab :value="2">
                            <div
                                class="leading-normal flex gap-2 items-center"
                            >
                                <i class="pi pi-history" />
                                <span
                                    data-testid="tab-logs"
                                    v-text="$t('logs.title')"
                                />
                            </div>
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel :value="0">
                            <SubmissionClaimTable
                                @scrollToClaimsTab="
                                () => {
                                    emits('scrollToClaimsTab');
                                }
                            "
                            />
                        </TabPanel>
                        <TabPanel :value="1">
                            <ActivityViewer :clientId="route.params.clientId" />
                        </TabPanel>
                        <TabPanel :value="2">
                            <AuditTable
                                entity="claim"
                                :entity_id="currentClaim.id"
                                :client_id="route.params.clientId"
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                <!-- OLD DEPRECATED TABVIEW COMPONENT | please analyze if its everything is correct and delete this comment -->
                <!---------------------------------------------------------------->
                <!---------------------------------------------------------------->
                <!---------------------------------------------------------------->

                <!-- Tabs -->
<!--                <TabView-->
<!--                    v-if="showTable"-->
<!--                    :lazy="true"-->
<!--                    v-model:activeIndex="activeTab"-->
<!--                    class="mt-2"-->
<!--                    data-testid="tabview-expenses-documents"-->
<!--                >-->
<!--                    <TabPanel>-->
<!--                        <template #header>-->
<!--                            <div-->
<!--                                class="leading-normal flex gap-2 items-center"-->
<!--                            >-->
<!--                                <i class="pi pi-list" />-->
<!--                                <span-->
<!--                                    data-testid="tab-expenses"-->
<!--                                    v-text="$t('submissions.title')"-->
<!--                                />-->
<!--                            </div>-->
<!--                        </template>-->

<!--                        <SubmissionClaimTable-->
<!--                            @scrollToClaimsTab="-->
<!--                                () => {-->
<!--                                    emits('scrollToClaimsTab');-->
<!--                                }-->
<!--                            "-->
<!--                        />-->
<!--                    </TabPanel>-->
<!--                    <TabPanel>-->
<!--                        <template #header>-->
<!--                            <div-->
<!--                                class="leading-normal flex gap-2 items-center"-->
<!--                            >-->
<!--                                <i class="pi pi-folder" />-->
<!--                                <span-->
<!--                                    data-testid="tab-activities"-->
<!--                                    v-text="$t('activities.title')"-->
<!--                                />-->
<!--                            </div>-->
<!--                        </template>-->

<!--                        <ActivityViewer :clientId="route.params.clientId" />-->
<!--                    </TabPanel>-->
<!--                    <TabPanel>-->
<!--                        <template #header>-->
<!--                            <div-->
<!--                                class="leading-normal flex gap-2 items-center"-->
<!--                            >-->
<!--                                <i class="pi pi-history" />-->
<!--                                <span-->
<!--                                    data-testid="tab-logs"-->
<!--                                    v-text="$t('logs.title')"-->
<!--                                />-->
<!--                            </div>-->
<!--                        </template>-->
<!--                    </TabPanel>-->
<!--                </TabView>-->
            </div>
        </template>
    </Card>
</template>
