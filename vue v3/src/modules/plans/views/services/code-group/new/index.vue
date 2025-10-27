<script setup>
import lodash from 'lodash';
import { ref, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../../stores/CodeSet';
import { useHelpers } from '@/composables';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();

provideEditState();

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Enter Details',
        to: { name: 'New Code Group', params: { id } }
    },
    {
        label: 'Add Codes',
        to: { name: 'New Code Group Step 2', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Code Group Step 3', params: { id } }
    }
]);

onBeforeMount(() => {
    getItem();
});

watch(
    () => [codeSetStore.currentCodeGroup],
    () => {
        if (codeSetStore.currentCodeGroup)
            id.value = codeSetStore.currentCodeGroup.id;
    }
);

const getItem = async () => {
    if (codeSetStore.currentCodeGroup || route.params.id == '-1') return;
    const res = await codeSetStore.getCodeGroup(route.params.id);
    codeSetStore.setCurrentCodeGroup(res.data);
};

const goBack = () => {
    router.push({ name: 'Code Groups' });
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div
                            class="p-break-all"
                            data-testid="new-code-group-title"
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        codeSetStore.currentCodeGroup?.name
                                    ),
                                    {
                                        length: 80
                                    }
                                ) || $t('services.new_code_group')
                            }}
                        </div>
                        <StatusTag
                            v-if="codeSetStore.currentCodeGroup?.status"
                            class="ml-2"
                            :status="codeSetStore.currentCodeGroup?.status"
                        />
                    </div>
                    <div
                        v-if="codeSetStore.currentCodeGroup?.effective_date"
                        class="text-sm font-normal text-gray-700"
                        data-testid="new-code-group-effective-date"
                    >
                        Effective Date:
                        {{
                            helpers.formatDate(
                                codeSetStore.currentCodeGroup?.effective_date
                            )
                        }}
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    @click="goBack"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="px-4 py-2"
                    data-testid="back-button"
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
            <router-view />
        </div>
    </div>
</template>
