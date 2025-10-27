<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { contactSources } from '@/config';

import { usePoliciesStore } from '@/modules/policies/stores/Policies';

import Summary from '@/modules/policies/components/order/Summary.vue';

const route = useRoute();
const router = useRouter();
const policiesStore = usePoliciesStore();
const helpers = useHelpers();

const clientId = route.params.clientId;
const orderId = route.params.orderId;

const openOrderDetailsDialog = ref(false);
const order = ref(null);

const orderNumber = computed(() => {
    return order.value?.order_number;
});

const contactSourceName = computed(() => {
    return getNameById(contactSources, order.value?.contact_source);
});

const openOrderPoliciesDialog = (event) => {
    openOrderDetailsDialog.value = true;
};

const loadOrder = async () => {
    try {
        const res = await policiesStore.getOrder(orderId);
        const _order = res.data;

        order.value = _order;
        policiesStore.setOrderDetails(
            _order.client,
            _order.business_unit,
            _order.contact_source,
            _order.contact_source === 'message_center'
                ? { id: _order.message_id }
                : null
        );
    } finally {
    }
};

const getNameById = (dataSource, id) => {
    const item = dataSource.find((entry) => entry.id === id);
    return item ? item.name : null;
};

onBeforeMount(async () => {
    await loadOrder();
});
</script>

<template>
    <div class="mt-6">
        <Header @goBack="router.go(-1)">
            <template #title>
                <div>
                    <div class="flex flex-row gap-2">
                        <div class="p-break-word text-primary underline">
                            {{
                                $t('order_details.order', {
                                    orderNumber
                                })
                            }}
                        </div>
                    </div>
                    <div class="flex align-items-center">
                        <Button
                            class="no-outline p-0 text-primary"
                            data-testid="order-details-button"
                            @click="openOrderPoliciesDialog"
                            :label="
                                helpers.getLocaleValue(
                                    policiesStore.client?.name
                                )
                            "
                            link
                        />
                    </div>
                </div>
            </template>
        </Header>

        <Summary read-only :order="order" />

        <Dialog
            data-testid="order-dialog"
            v-if="openOrderDetailsDialog"
            v-model:visible="openOrderDetailsDialog"
            modal
            header="Order Details"
            :style="{ width: '480px' }"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex align-items-center justify-content-between w-full"
                >
                    <div
                        class="p-dialog-title"
                        data-testid="order-dialog-title"
                    >
                        {{ $t('order_details.title') }}
                    </div>
                    <Button
                        icon="pi pi-times"
                        class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                        data-testid="order-dialog-close"
                        @click="openOrderDetailsDialog = false"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="text-sm">
                <div>
                    <div class="details">
                        <p>
                            <span data-testid="order-client-label">{{
                                $t('order_details.client')
                            }}</span>
                        </p>
                        <p>
                            <span data-testid="order-client-value">
                                {{
                                    helpers.getLocaleValue(
                                        policiesStore.client.name
                                    )
                                }}
                            </span>
                        </p>
                    </div>

                    <div class="details">
                        <p>
                            <span data-testid="order-business-unit-label">{{
                                $t('order_details.business_unit')
                            }}</span>
                        </p>
                        <p>
                            <span data-testid="order-business-unit-value">
                                {{
                                    helpers.getLocaleValue(
                                        policiesStore.businessUnit.name
                                    )
                                }}
                            </span>
                        </p>
                    </div>

                    <div class="details">
                        <p>
                            <span data-testid="order-contact-source-label">{{
                                $t('order_details.contact_source')
                            }}</span>
                        </p>
                        <p>
                            <span data-testid="order-contact-source-value">
                                {{ contactSourceName }}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style lang="scss">
.details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    p {
        text-align: left;
        width: 100%;
        padding-top: 0.5rem;
        margin-bottom: 2px;
    }

    p:first-of-type {
        font-weight: bold;
        width: 186px;
        margin-bottom: 2px;
    }
}
</style>
