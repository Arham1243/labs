<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useAnnouncementStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { computed } from 'vue';

const props = defineProps({
    mode: { type: String, required: true }
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const helpers = useHelpers();
const announcementStore = useAnnouncementStore();
const globalStore = useGlobalStore();
const busy = ref(false);
const loading = ref(false);
const ready = ref(false);
const announcementId = ref(route.params.id);
const plainMessage = ref('');
const portals = [
    { name: 'company' },
    { name: 'client' },
    { name: 'service_provider' },
    { name: 'insured' },
    { name: 'verse_mobile' },
    { name: 'website' }
];
const announcementTypes = [
    { name: 'info' },
    { name: 'warning' },
    { name: 'critical' }
];
const formData = ref({
    start_at: '',
    end_at: '',
    portals: [],
    type: '',
    message: ''
});

watch(
    () => formData.value.start_at,
    (start) => {
        if (!start) return;
        const startDate = new Date(start);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        if (
            !formData.value.end_at ||
            new Date(formData.value.end_at) < startDate
        ) {
            formData.value.end_at = endDate;
        }
    }
);

onBeforeMount(async () => {
    if (props.mode === 'edit') {
        await getItem();
        setTimeout(() => (ready.value = true), 50);
    } else {
        ready.value = true;
    }
});

const portalOptions = computed(() =>
    portals.map((type) => ({
        label: formatValue(type.name),
        value: type.name
    }))
);

const announcementTypesOptions = computed(() =>
    announcementTypes.map((type) => ({
        label: formatValue(type.name),
        value: type.name
    }))
);

const onTextChange = (e) => {
    plainMessage.value = e.textValue || '';
};

const stripHtmlToText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
};

const formatValue = (type) => {
    return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const pushRoute = (name) => {
    router.push({ name });
};

const onLoad = ({ instance }) => {
    instance.setContents(
        instance.clipboard.convert({
            html: formData.value.message
        })
    );
};

const save = async () => {
    const payload = {
        ...formData.value,
        start_at: helpers.parseDate(
            formData.value.start_at,
            'YYYY-MM-DD HH:mm:ss'
        ),
        end_at: helpers.parseDate(formData.value.end_at, 'YYYY-MM-DD HH:mm:ss')
    };
    try {
        busy.value = true;
        if (props.mode === 'new') {
            await announcementStore.create(payload);
        } else if (props.mode === 'edit') {
            await announcementStore.update(announcementId.value, payload);
        }
        pushRoute('Announcement');
    } catch (error) {
        console.error(error);
    } finally {
        busy.value = false;
    }
};

const getItem = async () => {
    if (!announcementId.value) return;
    try {
        loading.value = true;
        const res = await announcementStore.getItem(announcementId.value);
        formData.value = res?.data;
        plainMessage.value = stripHtmlToText(res?.data?.message || '');
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <Loader v-if="loading || !ready" />
    <template v-else>
        <div class="quater-screen flex flex-column justify-content-between">
            <Card>
                <template #content>
                    <div class="p-fluid formgrid grid">
                        <div class="field col-6 mb-4">
                            <label
                                class="block required mb-2"
                                for="start_at"
                                data-testid="start-date-time-label"
                            >
                                {{ $t('announcements.start_date_time') }}
                            </label>
                            <InputField
                                v-model="formData.start_at"
                                id="start_at"
                                variant="date"
                                data-testid="start-date-time-input"
                                showTime
                                hourFormat="12"
                            />
                        </div>
                        <div class="field col-6 mb-4">
                            <label
                                class="block required mb-2"
                                for="end_at"
                                data-testid="end-date-time-label"
                            >
                                {{ $t('announcements.end_date_time') }}
                            </label>
                            <InputField
                                v-model="formData.end_at"
                                id="end_at"
                                variant="date"
                                data-testid="end-date-time-input"
                                showTime
                                hourFormat="12"
                            />
                        </div>
                        <div class="field col-6 mb-4">
                            <label
                                class="block required mb-2"
                                for="portals"
                                data-testid="portal-label"
                            >
                                {{ $t('announcements.portal') }}
                            </label>
                            <InputField
                                data-testid="portal-input"
                                id="portals"
                                filter
                                variant="multiselect"
                                display="chip"
                                :options="portalOptions"
                                optionLabel="label"
                                optionValue="value"
                                :placeholder="$t('common.select')"
                                v-model="formData.portals"
                            />
                        </div>
                        <div class="field col-6 mb-4">
                            <label
                                class="block required mb-2"
                                for="type"
                                data-testid="type-label"
                                >{{
                                    $t('announcements.announcement_type')
                                }}</label
                            >
                            <InputField
                                data-testid="announcement-type-input"
                                v-model="formData.type"
                                :options="announcementTypesOptions"
                                :placeholder="$t('common.select')"
                                optionValue="value"
                                optionLabel="label"
                                class="w-full"
                                id="type"
                                variant="dropdown"
                            />
                        </div>
                        <div class="field col-12">
                            <label
                                class="block required mb-2"
                                for="message"
                                data-testid="announcement-message-label"
                                >{{ $t('announcements.message') }}</label
                            >
                            <Editor
                                key="message"
                                id="message"
                                v-model="formData.message"
                                editorStyle="height: 160px"
                                :formats="[
                                    'font',
                                    'header',
                                    'bold',
                                    'italic',
                                    'underline',
                                    'list',
                                    'link'
                                ]"
                                @load="onLoad"
                                @text-change="onTextChange"
                                data-testid="announcement-message-editor"
                            >
                                <template v-slot:toolbar>
                                    <span class="ql-formats">
                                        <select class="ql-header">
                                            <option value="1"></option>
                                            <option value="2"></option>
                                            <option value="3"></option>
                                            <option value="4"></option>
                                            <option value="5"></option>
                                            <option value="6"></option>
                                            <option selected></option>
                                        </select>
                                    </span>
                                    <span class="ql-formats">
                                        <select class="ql-font">
                                            <option selected></option>
                                            <option value="serif"></option>
                                            <option value="monospace"></option>
                                        </select>
                                    </span>
                                    <span class="ql-formats">
                                        <button class="ql-bold"></button>
                                        <button class="ql-italic"></button>
                                        <button class="ql-underline"></button>
                                    </span>
                                    <span class="ql-formats">
                                        <button
                                            class="ql-list"
                                            value="ordered"
                                        ></button>
                                        <button
                                            class="ql-list"
                                            value="bullet"
                                        ></button>
                                    </span>
                                    <span class="ql-formats">
                                        <button class="ql-link"></button>
                                    </span>
                                </template>
                            </Editor>
                            <small
                                v-if="globalStore.errors?.message?.length"
                                class="mt-2 p-error block mb-2"
                                v-text="globalStore.errors?.message[0]"
                                data-testid="validation-error"
                            />
                            <span
                                style="font-size: 1.05rem"
                                :class="[
                                    'block mt-3',
                                    plainMessage.length > 250
                                        ? 'text-red-500'
                                        : 'text-700'
                                ]"
                            >
                                {{ plainMessage.length }} / 250
                                {{ $t('announcements.characters') }}
                            </span>
                        </div>
                    </div>
                </template>
            </Card>
            <Card class="mt-4">
                <template #content>
                    <div
                        class="flex align-items-center justify-content-between"
                    >
                        <Button
                            data-testid="cancel-button"
                            :label="t('buttons.cancel')"
                            class="p-button-outlined"
                            @click="pushRoute('Announcement')"
                        />
                        <Button
                            data-testid="save-button"
                            :label="t('buttons.save')"
                            iconPos="right"
                            @click="save"
                            :loading="busy"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </template>
</template>
<style>
.quater-screen {
    min-height: calc(100vh - 250px);
}
</style>
