<script setup>
import { onBeforeMount, ref, defineExpose } from 'vue';
import { useSettingStore } from '@/modules/administration/stores';
import { useCommonStore } from '@/stores';

import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const settingStore = useSettingStore();
const commonStore = useCommonStore();
const loading = ref(false);
const loadingCurrencies = ref(false);
const busy = ref(false);
const selectedCurrency = ref({});
const currencies = ref([]);

onBeforeMount(async () => {
    await getCurrencies();
});

const goBack = () => {
    router.push({ name: 'Administration' });
};

const updateSettings = async () => {
    try {
        busy.value = true;
        await settingStore.updateSettings({
            default_currency: selectedCurrency.value
        });
        await getSettings();
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const getSettings = async () => {
    try {
        loading.value = true;
        const res = await settingStore.getSettings();
        selectedCurrency.value = res.currency;
    } finally {
        loading.value = false;
    }
};

const getCurrencies = async (search) => {
    try {
        loadingCurrencies.value = true;

        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchCurrencies(payload);
        currencies.value = res.data;
    } finally {
        loadingCurrencies.value = false;
    }
};

// Expose methods for testing
defineExpose({
    goBack,
    updateSettings,
    getSettings,
    getCurrencies
});
</script>
<template>
    <Loader v-if="loading" />
    <div v-else class="quater-screen flex flex-col justify-between">
             <Card class="mt-6">
            <template #content>
                <div class="p-fluid formgrid grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
                    <div class="field col-span-6 mb-12">
                        <label
                            class="block mb-2"
                            for="currency_id"
                            data-testid="short-date-label"
                        >
                            {{ $t('common.currency') }}
                        </label>
                        <!-- <ApiDropdown
                            data-testId="currency-input"
                            id="currency_id"
                            option-value="id"
                            option-label="id"
                            v-model="selectedCurrency"
                            @search="getCurrencies"
                            :loading="loadingCurrencies"
                            :items="currencies"
                        /> -->
                    </div>
                </div>
            </template>
        </Card>
 <Card class="mt-6">
            <template #content>
                <div class="flex items-center justify-between">
                    <Button
                        :label="t('buttons.cancel')"
                        class="p-button-outlined"
                        @click="goBack"
                    />
                    <Button
                        :label="t('buttons.save')"
                        iconPos="right"
                        @click="updateSettings"
                        :loading="busy"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
<style>
.quater-screen {
    min-height: calc(100vh - 250px);
}
</style>
