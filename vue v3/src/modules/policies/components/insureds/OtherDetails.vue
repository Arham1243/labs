<script setup>
import lodash from 'lodash';
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { useToast } from 'primevue/usetoast';
import { useEditState } from '@/modules/policies/composables/useEditState';
import { ability } from '@/plugins/ability';
import { PolicyModulePermission } from '@/config';

const { t } = useI18n();
const insuredsStore = useInsuredsStore();
const { emit, bus } = useEventsBus();
const toast = useToast();
const { activeEditComponent, setActiveComponent, clearActiveComponent } =
    useEditState();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const insured = ref(props.insured);
const loading = ref(false);
const insuredToUpdate = ref({});
const isEditing = ref(false);

const isEditDisabled = computed(() => {
    return (
        (activeEditComponent.value &&
            activeEditComponent.value !==
                insuredsStore.insuredSections.OTHER) ||
        !ability.can(PolicyModulePermission.INSUREDS.INSUREDS.UPDATE)
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(insured.value, insuredToUpdate.value);
});

const settingLabel = (setting) => {
    return t(setting ? 'common.yes' : 'common.no');
};

const statusIcon = (setting) => {
    return setting ? 'pi pi-check' : 'pi pi-times';
};

const handleEdit = () => {
    insuredToUpdate.value = lodash.cloneDeep(insured.value);
    isEditing.value = true;
    setActiveComponent(insuredsStore.insuredSections.OTHER);
};

const handleCancel = () => {
    isEditing.value = false;
    clearActiveComponent();
};

const save = async () => {
    loading.value = true;
    try {
        const data = insuredToUpdate.value || {};
        const payload = [
            'group_claims',
            'block_enrollment',
            'allow_print_visa_letter',
            'allow_file_upload'
        ].reduce((obj, key) => {
            if (key in data) {
                obj[key] = data[key];
            }
            return obj;
        }, {});

        await insuredsStore.updateInsured(
            insured.value.client_id,
            insured.value.id,
            payload
        );

        emit('refresh');
        handleCancel();

        toast.add({
            severity: 'success',
            summary: t('insured_overview.other_details.save_success_title'),
            detail: t('insured_overview.other_details.save_success_message'),
            life: 5000
        });
    } catch (error) {
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2" data-testid="other-details-title">
            {{ $t('insured_overview.other_details.title') }}
        </h5>
        <div v-if="isEditing">
            <Button
                :label="$t('buttons.cancel')"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.save')"
                :loading="loading"
                :disabled="isNotChanged"
                @click="save"
                data-testid="save-button"
            />
        </div>
        <Button
            v-else
            :disabled="isEditDisabled"
            size="small"
            text
            class="px-2 py-1"
            :label="$t('buttons.edit')"
            icon="pi pi-pencil"
            data-testid="edit-button"
            @click="handleEdit"
        />
    </div>

    <div class="p-fluid formgrid grid mt-4" v-if="isEditing">
        <div class="field col-12 flex align-content-center">
            <label
                for="group-claims-input"
                class="mr-3 col-3"
                data-testid="group-claims-label"
            >
                {{ $t('insured_overview.other_details.group_claims') }}
            </label>
            <InputField
                variant="switch"
                binary
                :trueValue="1"
                :falseValue="0"
                v-model="insuredToUpdate.group_claims"
                id="group-claims-input"
                data-testid="group-claims-input"
            />
        </div>

        <div class="field col-12 flex align-content-center">
            <label
                for="block-enrolment-input"
                class="mr-3 col-3"
                data-testid="block-enrolment-label"
            >
                {{ $t('insured_overview.other_details.block_enrolment') }}
            </label>
            <InputField
                variant="switch"
                binary
                :trueValue="1"
                :falseValue="0"
                v-model="insuredToUpdate.block_enrollment"
                id="block-enrolment-input"
                data-testid="block-enrolment-input"
            />
        </div>

        <div class="field col-12 flex align-content-center">
            <label
                for="visa-letter-input"
                class="mr-3 col-3"
                data-testid="visa-letter-label"
            >
                {{
                    $t('insured_overview.other_details.allow_print_visa_letter')
                }}
            </label>
            <InputField
                variant="switch"
                binary
                :trueValue="1"
                :falseValue="0"
                v-model="insuredToUpdate.allow_print_visa_letter"
                id="visa-letter-input"
                data-testid="visa-letter-input"
            />
        </div>

        <div class="field col-12 flex align-content-center">
            <label
                for="file-upload-input"
                class="mr-3 col-3"
                data-testid="file-upload-label"
            >
                {{ $t('insured_overview.other_details.allow_file_upload') }}
            </label>
            <InputField
                variant="switch"
                binary
                :trueValue="1"
                :falseValue="0"
                v-model="insuredToUpdate.allow_file_upload"
                id="file-upload-input"
                data-testid="file-upload-input"
            />
        </div>
    </div>

    <div class="grid mt-1" v-else>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="group-claims-label"
        >
            {{ $t('insured_overview.other_details.group_claims') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 flex gap-2"
            data-testid="group-claims"
        >
            <i class="pi" :class="statusIcon(insured.group_claims)" />
            <span>{{ settingLabel(insured.group_claims) }}</span>
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="block-enrolment-label"
        >
            {{ $t('insured_overview.other_details.block_enrolment') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 flex gap-2"
            data-testid="block-enrolment"
        >
            <i class="pi" :class="statusIcon(insured.block_enrollment)" />
            <span>{{ settingLabel(insured.block_enrollment) }}</span>
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="visa-letter-label"
        >
            {{ $t('insured_overview.other_details.allow_print_visa_letter') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 flex gap-2"
            data-testid="visa-letter"
        >
            <i
                class="pi"
                :class="statusIcon(insured.allow_print_visa_letter)"
            />
            <span>{{ settingLabel(insured.allow_print_visa_letter) }}</span>
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="file-upload-label"
        >
            {{ $t('insured_overview.other_details.allow_file_upload') }}
        </div>
        <div
            class="sm:col-6 md:col-8 text-sm py-1 flex gap-2"
            data-testid="file-upload"
        >
            <i class="pi" :class="statusIcon(insured.allow_file_upload)" />
            <span>{{ settingLabel(insured.allow_file_upload) }}</span>
        </div>
    </div>
</template>
