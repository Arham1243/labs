<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import useEventsBus from '@/composables/event-bus';

import Overview from '@/modules/policies/components/insureds/Overview.vue';
import ClaimsOverview from '@/modules/policies/components/insureds/ClaimsOverview.vue';
import AuditTable from '@/components/common/AuditTable.vue';

const { t } = useI18n();
const router = useRouter();
const insuredsStore = useInsuredsStore();
const { bus } = useEventsBus();

const props = defineProps({
    insuredId: {
        type: String,
        required: true
    }
});

const menu = ref();
const isLoading = ref(true);
const insured = ref({});

const menuItems = computed(() => {
    return [
        {
            label: t('common.edit'),
            icon: 'pi pi-pencil',
            command: () => goBack()
        },
        {
            label: t('common.delete'),
            icon: 'pi pi-trash',
            command: () => goBack()
        }
    ];
});

const insuredName = computed(() => {
    return `${insured.value?.first_name} ${insured.value?.last_name}`;
});

const goBack = () => {
    router.push({ name: 'Insured Overview' });
};

const showMenu = (event) => {
    menu.value.toggle(event);
};

const getInsured = async () => {
    try {
        isLoading.value = true;
        const res = await insuredsStore.getInsured(props.insuredId);
        insured.value = res.data;
    } catch (error) {
        goBack();
    } finally {
        isLoading.value = false;
    }
};

const refresh = () => {
    getInsured();
};

onBeforeMount(() => {
    refresh();
});

watch(
    () => bus.value.get('refresh'),
    () => {
        getInsured();
    }
);
</script>

<template>
    <Loader v-if="isLoading" />
    <div v-else class="col-12">
        <Header @goBack="goBack">
            <template #title>
                <div data-testid="insured-name">{{ insuredName }}</div>
            </template>
            <template #actions>
                <Button
                    v-if="false"
                    :label="$t('common.actions')"
                    data-testid="actions-button"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    @click="showMenu"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
            </template>
        </Header>
        <TabView lazy>
            <TabPanel
                :header="$t('insured_overview.headers.overview')"
                :pt="{
                    root: {
                        'data-testid': 'overview-tab-panel'
                    }
                }"
            >
                <div data-testid="overview-div">
                    <div class="grid my-2">
                        <Overview :insured="insured" @refresh="refresh" />
                    </div>
                </div>
            </TabPanel>
            <TabPanel
                :header="$t('insured_overview.headers.claims')"
                :pt="{
                    root: {
                        'data-testid': 'claims-tab-panel'
                    }
                }"
            >
                <div data-testid="claims-div">
                    <div class="my-5">
                        <ClaimsOverview :insured="insured" @refresh="refresh" />
                    </div>
                </div>
            </TabPanel>
            <TabPanel
                :header="$t('insured_overview.headers.activities')"
                :pt="{
                    root: {
                        'data-testid': 'activities-tab-panel'
                    }
                }"
                v-if="false"
            >
                <div data-testid="activities-div">Activities</div>
            </TabPanel>
            <TabPanel
                :header="$t('insured_overview.headers.consents')"
                :pt="{
                    root: {
                        'data-testid': 'consents-tab-panel'
                    }
                }"
                v-if="false"
            >
                <div data-testid="consents-div">Consents</div>
            </TabPanel>
            <TabPanel
                :header="$t('insured_overview.headers.audit_log')"
                lazy
                :pt="{
                    root: {
                        'data-testid': 'audit-log-tab-panel'
                    }
                }"
            >
                <Card class="mt-5" data-testid="audit-log">
                    <template #content>
                        <AuditTable :entity_id="insured.id" entity="insured" />
                    </template>
                </Card>
            </TabPanel>
        </TabView>
        <router-view> </router-view>
    </div>
</template>
