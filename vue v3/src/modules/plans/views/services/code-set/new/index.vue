<script setup>
import lodash from 'lodash';
import { ref, watch, onMounted } from 'vue';
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
        label: 'Code Set Details',
        to: { name: 'New Code Set', params: { id } }
    },
    {
        label: 'Add Codes',
        to: { name: 'New Code Set Step 2', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Code Set Step 3', params: { id } }
    }
]);

onMounted(async () => {
    await getItem();
});

watch(
    () => [codeSetStore.currentCodeSet],
    () => {
        if (codeSetStore.currentCodeSet)
            id.value = codeSetStore.currentCodeSet.id;
    }
);

const getItem = async () => {
    if (codeSetStore.currentCodeSet || route.params.id == '-1') return;
    const res = await codeSetStore.getCodeSet(route.params.id);
    codeSetStore.setCurrentCodeSet(res.data);
};

const goBack = () => {
    router.push({ name: 'Code Sets' });
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
                            data-testid="new-code-set-title"
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        codeSetStore.currentCodeSet?.name
                                    ),
                                    {
                                        length: 80
                                    }
                                ) || $t('services.new_code_set')
                            }}
                        </div>
                        <StatusTag
                            v-if="codeSetStore.currentCodeSet?.status"
                            class="ml-2"
                            :status="codeSetStore.currentCodeSet?.status"
                        />
                    </div>
                    <div
                        v-if="codeSetStore.currentCodeSet?.effective_date"
                        class="text-sm font-normal text-gray-700"
                        data-testid="new-code-set-effective-date"
                    >
                        Effective Date:
                        {{
                            helpers.formatDate(
                                codeSetStore.currentCodeSet?.effective_date
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
