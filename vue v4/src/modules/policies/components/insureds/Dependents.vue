<script setup>
import { ref } from 'vue';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';

import ItemCard from '@/modules/policies/components/insureds/ItemCard.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import { useI18n } from 'vue-i18n';
import DependentDetails from '@/modules/policies/components/insureds/DependentDetails.vue';
import DependentAddress from '@/modules/policies/components/insureds/DependentAddress.vue';
import DependentBeneficiaryDetails from '@/modules/policies/components/insureds/DependentBeneficiaryDetails.vue';
import useEventsBus from '@/composables/event-bus';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';

const router = useRouter();
const helpers = useHelpers();
const { t } = useI18n();
const { emit } = useEventsBus();
const insuredsStore = useInsuredsStore();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const insured = ref(props.insured);
const dependents = ref(insured.value.dependents.reverse());
const showDependentDetails = ref(false);
const selectedDependent = ref();
const showDependentList = ref(false);

const getDependentName = (dependent) => {
    const insured = dependent?.dependent_insured;
    const policy = dependent?.dependent_policy;
    return `${insured?.first_name} ${insured?.last_name} - ${t(
        'insured_overview.dependents.linked_policy'
    )} ${policy?.policy_number}`;
};

const getDependentDetails = (dependent) => {
    const insured = dependent?.dependent_insured;
    return `DOB: ${helpers.formatDate(
        insured?.date_of_birth,
        'DD-MMM-YYYY'
    )} · ${helpers.capitalizeWords(dependent?.relation)}`;
};

const getDependentPolicyStatus = (dependent) => {
    const policy = dependent?.dependent_policy;
    return policy?.status?.replace('_', ' ');
};

const viewDependentDetails = (dependent) => {
    getDependentInsuredByClient(
        dependent.client_id,
        dependent.dependent_insured.id
    )
        .then((data) => {
            dependent.dependent_insured = {
                ...dependent.dependent_insured,
                ...data
            };
            selectedDependent.value = dependent;

            showDependentDetails.value = true;
        })
        .catch((e) => console.log(e));
};

const goToDependent = (dependent) => {
    router
        .push({
            name: 'Details',
            params: { insuredId: dependent.dependent_insured.id }
        })
        .then(() => {
            emit('refresh');
        });
};

const viewDependentList = () => {
    showDependentList.value = true;
};

const getDependentInsuredByClient = async (clientId, insuredId) => {
    try {
        const res = await insuredsStore.getInsuredByClient(clientId, insuredId);
        return res.data;
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <ItemCard
        data-testid="insured-dependents"
        v-for="(dependent, index) in dependents.slice(0, 2)"
        :key="index"
        :title="getDependentName(dependent)"
        :detailsLeft="getDependentDetails(dependent)"
        :status="getDependentPolicyStatus(dependent)"
        @click="viewDependentDetails(dependent)"
    />

    <div v-if="dependents?.length > 2">
        <Button
            link
            :label="$t('insured_overview.dependents.view_all_dependents')"
            @click="viewDependentList"
        />
    </div>

    <Dialog
        modal
        v-model:visible="showDependentDetails"
        class="w-7/12"
        :header="getDependentName(selectedDependent)"
    >
        <template #header>
            <div
                class="inline-flex items-start justify-start gap-2 w-full"
            >
                <span class="p-dialog-title whitespace-nowrap">{{
                    getDependentName(selectedDependent)
                }}</span>
            </div>
            <i
                class="pi pi-external-link mt-2 mr-12 cursor-pointer"
                @click="goToDependent(selectedDependent)"
            />
        </template>
        <div>
            <!--Primvue 4 Tabs-->
            <Tabs lazy value="0">
                <TabList>
                    <Tab value="0">
                        {{ $t('insured_overview.dependents.dependant_details') }}
                    </Tab>
                    <Tab value="1">
                        {{ $t('insured_overview.headers.audit_log') }}
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div data-testid="dependent-details-div">
                            <div class="grid grid-cols-12 my-2">
                                <div class="col-span-6">
                                    <Card class="h-full">
                                        <template #content>
                                            <DependentDetails
                                                :dependent="selectedDependent"
                                            />
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-span-6">
                                    <Card class="h-full">
                                        <template #content>
                                            <DependentAddress
                                                :dependent="selectedDependent"
                                            />
                                        </template>
                                    </Card>
                                </div>

                                <div class="col-span-12">
                                    <Card>
                                        <template #content>
                                            <DependentBeneficiaryDetails
                                                :dependent="selectedDependent"
                                            />
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <Card class="mt-20" data-testid="audit-log">
                            <template #content>
                                <AuditTable
                                    :entity_id="
                                        selectedDependent.dependent_insured?.id
                                    "
                                    entity="insured"
                                />
                            </template>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <!-- OLD DEPRECATED TABVIEW COMPONENT | please analyze if its everything is correct and delete this comment -->
            <!---------------------------------------------------------------->
            <!---------------------------------------------------------------->
            <!---------------------------------------------------------------->

<!--            <TabView lazy>-->
<!--                <TabPanel-->
<!--                    :class="bg - red - 500"-->
<!--                    :header="-->
<!--                        $t('insured_overview.dependents.dependant_details')-->
<!--                    "-->
<!--                >-->
<!--                    <div data-testid="dependent-details-div">-->
<!--                        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 my-2">-->
<!--                            <div class="col-span-6">-->
<!--                                <Card class="h-full">-->
<!--                                    <template #content>-->
<!--                                        <DependentDetails-->
<!--                                            :dependent="selectedDependent"-->
<!--                                        />-->
<!--                                    </template>-->
<!--                                </Card>-->
<!--                            </div>-->
<!--                            <div class="col-span-6">-->
<!--                                <Card class="h-full">-->
<!--                                    <template #content>-->
<!--                                        <DependentAddress-->
<!--                                            :dependent="selectedDependent"-->
<!--                                        />-->
<!--                                    </template>-->
<!--                                </Card>-->
<!--                            </div>-->

<!--                            <div class="col-span-12">-->
<!--                                <Card>-->
<!--                                    <template #content>-->
<!--                                        <DependentBeneficiaryDetails-->
<!--                                            :dependent="selectedDependent"-->
<!--                                        />-->
<!--                                    </template>-->
<!--                                </Card>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </TabPanel>-->
<!--                <TabPanel-->
<!--                    :header="$t('insured_overview.headers.audit_log')"-->
<!--                    lazy-->
<!--                >-->
<!--                    <Card class="mt-20" data-testid="audit-log">-->
<!--                        <template #content>-->
<!--                            <AuditTable-->
<!--                                :entity_id="-->
<!--                                    selectedDependent.dependent_insured?.id-->
<!--                                "-->
<!--                                entity="insured"-->
<!--                            />-->
<!--                        </template>-->
<!--                    </Card>-->
<!--                </TabPanel>-->
<!--            </TabView>-->
        </div>
    </Dialog>

    <Dialog
        modal
        v-model:visible="showDependentList"
        class="w-7/12"
        :header="$t('insured_overview.dependents.dependents')"
    >
        <div v-for="(dependent, index) in dependents" :key="index" class="mt-2">
            <ItemCard
                data-testid="modal-insured-dependents"
                :key="index"
                :title="getDependentName(dependent)"
                :detailsLeft="getDependentDetails(dependent)"
                :status="getDependentPolicyStatus(dependent)"
                @click="viewDependentDetails(dependent)"
            />
        </div>
    </Dialog>
</template>
