<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { maskPolicyNumber } from '@/modules/policies/utils/policyUtils';
import { ability } from '@/plugins/ability';

import PolicyDetails from '@/modules/policies/components/policies/PolicyDetails.vue';

const route = useRoute();
const router = useRouter();
const policiesStore = usePoliciesStore();

const policyId = route.params.policyId;
const clientId = route.params.clientId;

const isLoading = ref(false);
const item = ref({});
const loading = ref(true);
const showPolicyNumber = ref(false);

const policyNumber = computed(() => {
    return (item.policy_number =
        showPolicyNumber.value || !ability.can('view policy administrations')
            ? item.value.policy_number
            : maskPolicyNumber(item.value.policy_number));
});

const getItem = async () => {
    try {
        const res = await policiesStore.getPolicy(clientId, policyId);
        item.value = res.data;
    } catch (e) {
    } finally {
    }
};

const toggleMaskPolicyNumber = () => {
    showPolicyNumber.value = !showPolicyNumber.value;
};

const getStatus = (status) => {
    return status ? status.split('_').join(' ') : null;
};

onBeforeMount(async () => {
    loading.value = true;

    await getItem();

    loading.value = false;
});
</script>

<template>
    <Loader v-if="loading" />
    <div class="relative container" v-else>
        <Header @goBack="router.go(-1)">
            <template #title>
                <div>
                    <div class="flex flex-row gap-2">
                        <div
                            class="p-break-word text-primary underline"
                            data-testid="policy-user-name"
                        >
                            {{ `${item.first_name} ${item.last_name}` }}
                        </div>

                        <div>
                            <StatusTag
                                :status="getStatus(item.status)"
                                data-testid="status-tag"
                            />
                        </div>
                    </div>
                    <p
                        class="p-component text-gray-600 flex align-items-center"
                    >
                        <span>{{
                            `${$t('policies.policies_table.order')} ${
                                item.order_number
                            }`
                        }}</span>
                        •
                        <span>{{
                            `${$t(
                                'policies.policies_table.policy'
                            )} ${policyNumber}`
                        }}</span>
                        <i
                            v-if="$ability.can('view policy administrations')"
                            class="pi text-primary cursor-pointer ml-1"
                            :class="
                                showPolicyNumber ? 'pi-eye-slash' : 'pi-eye'
                            "
                            @click="toggleMaskPolicyNumber()"
                        ></i>
                    </p>
                </div>
            </template>

            <template #actions>
                <Button
                    label="Actions"
                    data-testid="actions-button"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    :loading="isLoading"
                    @click="() => {}"
                />
            </template>
        </Header>
        <PolicyDetails :data="item" />
    </div>
</template>
