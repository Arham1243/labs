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
    <Tabs
        :lazy="true"
        :value="props.activeSideBarTab?.toString() || '0'"
    >
        <TabList>
            <Tab value="0">
                <div
                    class="flex items-center gap-2"
                    data-testid="tab-insured-details"
                >
                    <i class="pi pi-user"></i>
                    <span class="font-bold whitespace-nowrap">{{
                            $t('insureds.insured_details')
                        }}</span>
                </div>
            </Tab>
            <Tab value="1">
                <div
                    class="flex items-center gap-2"
                    data-testid="tab-policies"
                >
                    <i class="pi pi-shield"></i>
                    <span class="font-bold whitespace-nowrap">{{
                            $t('policies.title')
                        }}</span>
                </div>
            </Tab>
            <Tab value="2">
                <div
                    class="flex items-center gap-2"
                    data-testid="tab-organization"
                >
                    <i class="pi pi-building"></i>
                    <span class="font-bold whitespace-nowrap">{{
                            $t('organization.title')
                        }}</span>
                </div>
            </Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <!--            <pre>{{data}}</pre>-->
                <InsuredSidebarTab class="mt-4" :insured="data" />
            </TabPanel>
            <TabPanel value="1">
                <PolicySidebarTab :policies="currentInsured?.policies" />
            </TabPanel>
            <TabPanel value="2">
                <OrganizationSidebarTab class="mt-4" />
            </TabPanel>
        </TabPanels>
    </Tabs>


    <!-- OLD DEPRECATED TABVIEW COMPONENT | please analyze if its everything is correct and delete this comment -->
    <!---------------------------------------------------------------->
    <!---------------------------------------------------------------->
    <!---------------------------------------------------------------->

<!--    <TabView-->
<!--        :lazy="true"-->
<!--        class="mt-5"-->
<!--        v-model:activeIndex="props.activeSideBarTab"-->
<!--    >-->
<!--        <TabPanel>-->
<!--            <template #header>-->
<!--                <div-->
<!--                    class="flex items-center gap-2"-->
<!--                    data-testid="tab-insured-details"-->
<!--                >-->
<!--                    <i class="pi pi-user"></i>-->
<!--                    <span class="font-bold whitespace-nowrap">{{-->
<!--                        $t('insureds.insured_details')-->
<!--                    }}</span>-->
<!--                </div>-->
<!--            </template>-->
<!--            &lt;!&ndash;            <pre>{{data}}</pre>&ndash;&gt;-->
<!--            <InsuredSidebarTab class="mt-4" :insured="data" />-->
<!--        </TabPanel>-->
<!--        <TabPanel>-->
<!--            <template #header>-->
<!--                <div-->
<!--                    class="flex items-center gap-2"-->
<!--                    data-testid="tab-policies"-->
<!--                >-->
<!--                    <i class="pi pi-shield"></i>-->
<!--                    <span class="font-bold whitespace-nowrap">{{-->
<!--                        $t('policies.title')-->
<!--                    }}</span>-->
<!--                </div>-->
<!--            </template>-->
<!--            <PolicySidebarTab :policies="currentInsured?.policies" />-->
<!--        </TabPanel>-->
<!--        <TabPanel>-->
<!--            <template #header>-->
<!--                <div-->
<!--                    class="flex items-center gap-2"-->
<!--                    data-testid="tab-organization"-->
<!--                >-->
<!--                    <i class="pi pi-building"></i>-->
<!--                    <span class="font-bold whitespace-nowrap">{{-->
<!--                        $t('organization.title')-->
<!--                    }}</span>-->
<!--                </div>-->
<!--            </template>-->
<!--            <OrganizationSidebarTab class="mt-4" />-->
<!--        </TabPanel>-->
<!--    </TabView>-->
</template>
