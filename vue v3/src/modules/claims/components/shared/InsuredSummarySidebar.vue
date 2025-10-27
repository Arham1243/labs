<script setup>
import { useRoute } from 'vue-router';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';
import InsuredSidebarTab from '@/modules/claims/components/insureds/InsuredSidebarTab.vue';
import PolicySidebarTab from '@/modules/claims/components/insureds/PolicySidebarTab.vue';
import OrganizationSidebarTab from '@/modules/claims/components/insureds/OrganizationSidebarTab.vue';

const props = defineProps({
    activeSideBarTab: { type: Number },
    insuredId: { type: [String, Number], required: true }
});

const route = useRoute();

const { currentInsured, getInsuredById } = useClaimInsuredStore();
const { data } = getInsuredById(route.params.clientId, props.insuredId, true);
</script>

<template>
    <TabView
        :lazy="true"
        class="mt-5"
        v-model:activeIndex="props.activeSideBarTab"
    >
        <TabPanel>
            <template #header>
                <div
                    class="flex align-items-center gap-2"
                    data-testid="tab-insured-details"
                >
                    <i class="pi pi-user"></i>
                    <span class="font-bold white-space-nowrap">{{
                        $t('insureds.insured_details')
                    }}</span>
                </div>
            </template>
            <!--            <pre>{{data}}</pre>-->
            <InsuredSidebarTab class="mt-4" :insured="data" />
        </TabPanel>
        <TabPanel>
            <template #header>
                <div
                    class="flex align-items-center gap-2"
                    data-testid="tab-policies"
                >
                    <i class="pi pi-shield"></i>
                    <span class="font-bold white-space-nowrap">{{
                        $t('policies.title')
                    }}</span>
                </div>
            </template>
            <PolicySidebarTab :policies="currentInsured?.policies" />
        </TabPanel>
        <TabPanel>
            <template #header>
                <div
                    class="flex align-items-center gap-2"
                    data-testid="tab-organization"
                >
                    <i class="pi pi-building"></i>
                    <span class="font-bold white-space-nowrap">{{
                        $t('organization.title')
                    }}</span>
                </div>
            </template>
            <OrganizationSidebarTab class="mt-4" />
        </TabPanel>
    </TabView>
</template>
