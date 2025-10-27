<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import useEventsBus from '@/composables/event-bus.js';

const router = useRouter();
const policiesStore = usePoliciesStore();
const { emit } = useEventsBus();

const downloadPolicySummary = (event) => {};
const downloadPolicyCertificates = (event) => {};
const actions = ref([
    {
        name: 'Download Policy Summary',
        icon: 'pi pi-file',
        action: downloadPolicySummary
    },
    {
        name: 'Download Certifications of Policies',
        icon: 'pi pi-shield',
        action: downloadPolicyCertificates
    }
]);

const orderMorePolicies = (event) => {};
const done = (event) => {
    router.push({
        name: 'Orders'
    });
    policiesStore.clearOrderDetails();
};

emit('reloadCartSidebar');
</script>

<template>
    <div class="mt-6">
        <div class="flex justify-content-center">
            <card class="col-6">
                <template #content>
                    <div class="flex align-items-center flex-column">
                        <Avatar
                            icon="pi pi-check"
                            class="check-avatar-icon"
                            style="background-color: #16a34a; color: #fff"
                            shape="circle"
                        />
                        <div class="font-semibold text-2xl mt-4">
                            Your polices have been ordered successfully
                        </div>
                        <div class="text-base font-normal color-grey mt-2">
                            Order # is {{ policiesStore.order?.order_number }}
                        </div>
                    </div>
                </template>
            </card>
        </div>

        <div class="flex justify-content-center mt-3">
            <card class="col-6">
                <template #content>
                    <div class="flex align-items-center flex-column">
                        <div>
                            <div class="font-semibold text-xl">
                                Your policies are ready for download
                            </div>
                            <div class="text-sm font-normal color-grey mt-2">
                                You can always download them later from the
                                policies page
                            </div>
                        </div>
                        <div class="mt-4 w-full flex flex-column gap-4">
                            <SelectableIconButton
                                v-for="(action, index) in actions"
                                :key="`action-${index}`"
                                :icon="action.icon"
                                :label="action.name"
                                @click="action.action"
                            />
                        </div>
                        <div class="my-4">
                            <div class="flex gap-4">
                                <Button
                                    v-if="false"
                                    label="Order More Policies"
                                    class="p-button-outlined"
                                    icon="pi pi-plus"
                                    @click="orderMorePolicies"
                                />
                                <Button
                                    type="button"
                                    label="I am done"
                                    icon="pi pi-check"
                                    @click="done"
                                ></Button>
                            </div>
                        </div>
                    </div>
                </template>
            </card>
        </div>
    </div>
</template>

<style lang="scss">
.check-avatar-icon {
    width: 6rem !important;
    height: 6rem !important;

    .p-avatar-icon {
        font-size: 4rem !important;
    }
}

.color-grey {
    color: #495057;
}
</style>
