<script setup>
import { onBeforeMount, ref } from 'vue';
import { useSettingStore } from '@/modules/administration/stores';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import {
    days,
    shortDateFormats,
    longDateFormats,
    shortTimeFormats,
    longTimeFormats
} from '@/config/enums';
import { computed } from 'vue';

const { t } = useI18n();
const router = useRouter();
const settingStore = useSettingStore();
const loading = ref(false);
const busy = ref(false);
const formData = ref({
    short_date: '',
    long_date: '',
    short_time: '',
    long_time: '',
    first_day_of_week: ''
});

onBeforeMount(async () => {
    await getSettings();
});

const shortDateExample = computed(() => {
    const found = shortDateFormats.find(
        (f) => f.value === formData.value.short_date
    );
    return found ? found.example : '';
});

const longDateExample = computed(() => {
    const found = longDateFormats.find(
        (f) => f.value === formData.value.long_date
    );
    return found ? found.example : '';
});

const shortTimeExample = computed(() => {
    const found = shortTimeFormats.find(
        (f) => f.value === formData.value.short_time
    );
    return found ? found.example : '';
});

const longTimeExample = computed(() => {
    const found = longTimeFormats.find(
        (f) => f.value === formData.value.long_time
    );
    return found ? found.example : '';
});

const goBack = () => {
    router.push({ name: 'Administration' });
};

const updateSettings = async () => {
    try {
        busy.value = true;
        await settingStore.updateSettings(formData.value);
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

        formData.value = {
            short_date: res.date_time?.short_date,
            long_date: res.date_time?.long_date,
            short_time: res.date_time?.short_time,
            long_time: res.date_time?.long_time,
            first_day_of_week: res.date_time?.first_day_of_week
        };
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <Loader v-if="loading" />
    <div v-else class="quater-screen flex flex-col justify-between">
             <Card class="mt-6">
            <template #content>
                <div class="grid grid-cols-12 gap-4">
                    <div class="field col-span-6 mb-4">
                        <label
                            class="block required mb-2"
                            for="short_date"
                            data-testid="short-date-label"
                        >
                            {{ $t('settings.short_date') }}
                        </label>
                        <InputField
                            data-testid="short-date-input"
                            v-model="formData.short_date"
                            :options="shortDateFormats"
                            optionValue="value"
                            :placeholder="$t('settings.short_date')"
                            optionLabel="label"
                            class="w-full"
                            id="short_date"
                            variant="select"
                        />
                    </div>
                    <div class="col-span-6 mb-4">
                        <label
                            class="block required mb-2"
                            for="long_date"
                            data-testid="long-date-label"
                        >
                            {{ $t('settings.long_date') }}
                        </label>
                        <InputField
                            data-testid="long-date-input"
                            v-model="formData.long_date"
                            :options="longDateFormats"
                            optionValue="value"
                            :placeholder="$t('settings.long_date')"
                            optionLabel="label"
                            class="w-full"
                            id="long_date"
                            variant="select"
                        />
                    </div>
                    <div class="col-span-6 mb-4">
                        <label
                            class="block required mb-2"
                            for="short_time"
                            data-testid="short-time-label"
                        >
                            {{ $t('settings.short_time') }}
                        </label>
                        <InputField
                            data-testid="short-time-input"
                            v-model="formData.short_time"
                            :options="shortTimeFormats"
                            optionValue="value"
                            :placeholder="$t('settings.short_time')"
                            optionLabel="label"
                            class="w-full"
                            id="short_time"
                            variant="select"
                        />
                    </div>
                    <div class="col-span-6 mb-4">
                        <label
                            class="block required mb-2"
                            for="long_time"
                            data-testid="long-time-label"
                        >
                            {{ $t('settings.long_time') }}
                        </label>
                        <InputField
                            data-testid="long-time-input"
                            v-model="formData.long_time"
                            :options="longTimeFormats"
                            optionValue="value"
                            :placeholder="$t('settings.long_time')"
                            optionLabel="label"
                            class="w-full"
                            id="long_time"
                            variant="select"
                        />
                    </div>
                    <div class="col-span-6 mb-4">
                        <label
                            class="block required mb-2"
                            for="first_day_of_week"
                            data-testid="first-day-of-week-label"
                        >
                            {{ $t('settings.first_day_of_week') }}
                        </label>
                        <InputField
                            data-testid="first-day-of-week-input"
                            v-model="formData.first_day_of_week"
                            :options="days"
                            optionValue="value"
                            :placeholder="$t('settings.first_day_of_week')"
                            optionLabel="label"
                            class="w-full"
                            id="first_day_of_week"
                            variant="select"
                        />
                    </div>
                </div>
                <div
                    style="font-size: 1rem"
                    class="px-0 font-bold my-6"
                    data-testid="example-name"
                >
                    {{ $t('settings.examples') }}
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div
                        v-if="shortDateExample"
                        class="col-span-6 flex gap-12 py-0 mt-4"
                        data-testid="example-short-date"
                    >
                        <div
                            style="font-size: 1rem"
                            class="px-0 font-bold py-0"
                            data-testid="example-name-short-date"
                        >
                            {{ $t('settings.short_date') }}
                        </div>
                        <div
                            style="font-size: 1rem"
                            class="font-semibold p-break-word text-gray-600"
                            data-testid="example-value-short-date"
                        >
                            {{ shortDateExample }}
                        </div>
                    </div>
                    <div
                        v-if="longDateExample"
                        class="col-span-6 flex gap-12 py-0 mt-4"
                        data-testid="example-long-date"
                    >
                        <div
                            style="font-size: 1rem"
                            class="px-0 font-bold py-0"
                            data-testid="example-name-long-date"
                        >
                            {{ $t('settings.long_date') }}
                        </div>
                        <div
                            style="font-size: 1rem"
                            class="font-semibold p-break-word text-gray-600"
                            data-testid="example-value-long-date"
                        >
                            {{ longDateExample }}
                        </div>
                    </div>
                    <div
                        v-if="shortTimeExample"
                        class="col-span-6 flex gap-12 py-0 mt-4"
                        data-testid="example-short-time"
                    >
                        <div
                            style="font-size: 1rem"
                            class="px-0 font-bold py-0"
                            data-testid="example-name-short-time"
                        >
                            {{ $t('settings.short_time') }}
                        </div>
                        <div
                            style="font-size: 1rem"
                            class="font-semibold p-break-word text-gray-600"
                            data-testid="example-value-short-time"
                        >
                            {{ shortTimeExample }}
                        </div>
                    </div>
                    <div
                        v-if="longTimeExample"
                        class="col-span-6 flex gap-12 py-0 mt-4"
                        data-testid="example-long-time"
                    >
                        <div
                            style="font-size: 1rem"
                            class="px-0 font-bold py-0"
                            data-testid="example-name-long-time"
                        >
                            {{ $t('settings.long_time') }}
                        </div>
                        <div
                            style="font-size: 1rem"
                            class="font-semibold p-break-word text-gray-600"
                            data-testid="example-value-long-time"
                        >
                            {{ longTimeExample }}
                        </div>
                    </div>
                </div>
            </template>
        </Card>
        <Card>
            <template #content>
                <div class="flex items-center justify-between">
                    <Button
                        data-testid="cancel-button"
                        :label="t('buttons.cancel')"
                        class="p-button-outlined"
                        @click="goBack"
                    />
                    <Button
                        data-testid="save-button"
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
