<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BeneficiaryList from '@/modules/policies/components/insureds/BeneficiaryList.vue';
import BeneficiaryDetails from '@/modules/policies/components/insureds/BeneficiaryDetails.vue';
import { BeneficiaryTypes, PolicyModulePermission } from '@/config';
import { ability } from '@/plugins/ability';
import { useInsuredsStore } from '@/modules/policies/stores/index.js';
import useEventsBus from '@/composables/event-bus.js';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const insuredsStore = useInsuredsStore();
const { emit } = useEventsBus();
const toast = useToast();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const insured = ref(props.insured);
const selected = ref();
const showBeneficiarySidebar = ref(false);
const showCloseFormConfirmation = ref(false);
const detailsRef = ref(null);

const sidebarPassThroughOptions = {
    headerContent: { class: 'w-full' },
    closeButton: {
        'data-testid': 'beneficiary-sidebar-close-button'
    }
};

const beneficiariesCount = computed(() => {
    return insured.value?.beneficiaries?.length || 0;
});

const openBeneficiarySidebar = (beneficiary) => {
    showBeneficiarySidebar.value = true;
    selected.value = beneficiary;
};

const closeBeneficiarySidebar = () => {
    showBeneficiarySidebar.value = false;
};

const openFormConfirmation = () => {
    showCloseFormConfirmation.value = true;
};

const closeFormConfirmation = () => {
    showCloseFormConfirmation.value = false;
};

const handleCloseFormConfirmation = () => {
    closeFormConfirmation();
    closeBeneficiarySidebar();
};

const handleSideBarCancel = () => {
    if (detailsRef.value?.isDirty) {
        openFormConfirmation();
    } else {
        closeBeneficiarySidebar();
    }
};

const removeBeneficiary = (beneficiary) => {
    if (!!beneficiary?.id) {
        insuredsStore
            .deleteBeneficiary(
                beneficiary.client_id,
                beneficiary.insured_id,
                beneficiary.id
            )
            .then(() => {
                toast.add({
                    severity: 'success',
                    summary: t('insured_overview.beneficiaries.beneficiaries'),
                    detail: t(
                        'insured_overview.beneficiaries.delete_success_message'
                    ),
                    life: 2000
                });

                setTimeout(() => {
                    emit('refresh');
                }, 1000);
            });
    }
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center">
            <h5 data-testid="beneficiaries-count">
                {{
                    $t('insured_overview.beneficiaries_count', {
                        count: beneficiariesCount
                    })
                }}
            </h5>
            <Button
                v-if="
                    ability.can(
                        PolicyModulePermission.INSUREDS.BENEFICIARIES.CREATE
                    )
                "
                data-testid="new-beneficiary-button"
                type="button"
                class="p-button-outlined"
                :label="$t('insured_overview.new_beneficiary')"
                icon="pi pi-plus"
                @click="openBeneficiarySidebar()"
            />
        </div>
        <div
            class="color-grey text-sm mt-12"
            data-testid="no-beneficiaries-message"
            v-if="beneficiariesCount === 0"
        >
            {{ $t('insured_overview.no_beneficiaries') }}
        </div>
        <div v-else class="mt-2 flex flex-col items-stretch gap-2">
            <BeneficiaryList
                :insured="insured"
                @view="openBeneficiarySidebar"
                @removeBeneficiary="removeBeneficiary"
            />
        </div>
    </div>

    <Drawer
        :visible="showBeneficiarySidebar"
        position="right"
        :dismissable="false"
        class="w-35rem enrollment-sidebar"
        :data-testid="'beneficiary-sidebar'"
        :pt="sidebarPassThroughOptions"
        @update:visible="handleSideBarCancel"
    >
        <template #header>
            <div
                class="inline-flex justify-between items-center w-full"
            >
                <h5 class="text-left mt-0">
                    <span :data-testid="'applicant-sidebar-title'">
                        {{
                            $t(
                                'insured_overview.beneficiaries.beneficiary_details'
                            )
                        }}
                    </span>
                </h5>

                <div>
                    <Button
                        v-if="
                            !!selected?.id &&
                            ability.can(
                                PolicyModulePermission.INSUREDS.BENEFICIARIES
                                    .DELETE
                            )
                        "
                        link
                        icon="pi pi-trash"
                        class="ml-3"
                        style="color: red"
                        @click="() => removeBeneficiary(selected)"
                        :data-testid="`btn-form-remove-beneficiary`"
                    />

                    <Button
                        v-if="
                            !detailsRef?.isEditing &&
                            ability.can(
                                PolicyModulePermission.INSUREDS.BENEFICIARIES
                                    .UPDATE
                            )
                        "
                        link
                        icon="pi pi-pencil"
                        class="mr-3"
                        @click="detailsRef.enableEditing()"
                    />
                </div>
            </div>
        </template>

        <BeneficiaryDetails
            ref="detailsRef"
            :insured="insured"
            :beneficiary="selected"
            @close="closeBeneficiarySidebar"
            @confirmClose="openFormConfirmation"
        />
    </Drawer>

    <Confirmation
        v-model="showCloseFormConfirmation"
        :header="$t('insured_overview.beneficiaries.close_confirmation_title')"
        :content="
            $t('insured_overview.beneficiaries.close_confirmation_message')
        "
        :confirmButtonText="$t('buttons.confirm')"
        :cancelButtonText="$t('buttons.close')"
        confirm-button-class="p-button-danger"
        dialogTestid="close-form-dialog"
        headerTestid="close-form-dialog-title"
        contentTestid="close-form-dialog-content"
        cancelButtonTestid="close-form-dialog-cancel-button"
        closeButtonTestid="close-form-dialog-close-button"
        confirmButtonTestid="close-form-dialog-confirm-button"
        @confirm="handleCloseFormConfirmation"
    />
</template>
