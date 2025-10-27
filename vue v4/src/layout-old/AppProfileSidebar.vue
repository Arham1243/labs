<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useAuthStore, useSessionStore, useGlobalStore } from '@/stores';
import useEventsBus from '@/composables/event-bus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import OtpInput from 'vue3-otp-input';

const { t } = useI18n();
const { layoutState } = useLayout();
const { emit } = useEventsBus();
const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();
const globalStore = useGlobalStore();
const currentUser = sessionStore.user;
const isDialogVisible = ref(false);
const busy = ref(false);
const verifying = ref(false);
const dialogMode = ref('');
const otpKey = ref('');
const formData = ref({
    password: '',
    new_password: '',
    new_password_confirmation: ''
});

const verifyFormData = ref({
    token: '',
    code: ''
});

const rules = ref({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
});

const validatePassword = () => {
    const password = formData.value.new_password;

    rules.value.minLength = password.length >= 8;
    rules.value.uppercase = /[A-Z]/.test(password);
    rules.value.lowercase = /[a-z]/.test(password);
    rules.value.number = /[0-9]/.test(password);
    rules.value.symbol = /[@$!%*#?&]/.test(password);
};

const isCodeValid = computed(() => {
    return verifyFormData.value.code.length === 6;
});

const isPasswordValid = computed(
    () =>
        rules.value.minLength &&
        rules.value.uppercase &&
        rules.value.lowercase &&
        rules.value.number &&
        rules.value.symbol
);
const verificationMessage = computed(() => {
    const contactInfo = currentUser.email;
    return (
        t('auth.verify_code_message', { method: 'email' }) + ' ' + contactInfo
    );
});

const dialogHeader = computed(() => t('auth.change_password'));

const showNotifications = () => {
    emit('showNotifications');
};

const onShow = () => {
    resetForm();
};

const resetForm = () => {
    formData.value.password = '';
    formData.value.new_password = '';
    formData.value.new_password_confirmation = '';
    verifyFormData.value.token = '';
    verifyFormData.value.code = '';
    rules.value.minLength = false;
    rules.value.uppercase = false;
    rules.value.lowercase = false;
    rules.value.number = false;
    rules.value.symbol = false;
    globalStore.clearErrors();
};

const openDialog = (mode) => {
    dialogMode.value = mode;
    isDialogVisible.value = true;
};

const closeDialog = () => {
    isDialogVisible.value = false;
    resetForm();
};

const requestPasswordChange = async () => {
    try {
        busy.value = true;
        const res = await authStore.requestPasswordChange(formData.value);
        if (res.token) {
            dialogMode.value = 'verify';
            verifyFormData.value.token = res.token;
        }
    } finally {
        busy.value = false;
        verifyFormData.value.code = '';
    }
};

const verifyCode = async () => {
    try {
        verifying.value = true;
        const res = await authStore.verifyPasswordCode(verifyFormData.value);
        if (res.data.status) {
            closeDialog();
            layoutState.profileSidebarVisible.value = false;
        }
    } finally {
        verifying.value = false;
        otpKey.value = Date.now();
    }
};

const signOut = async () => {
    try {
        await authStore.logout();
    } finally {
        sessionStore.clearSessionState();
        router.push({ name: 'Login' });
    }
};
</script>

<template>
    <Sidebar
        v-model:visible="layoutState.profileSidebarVisible.value"
        position="right"
        class="layout-profile-sidebar w-full sm:w-[25rem]"
    >
        <div class="flex flex-col mx-auto md:mx-0">
            <span class="mb-2 font-semibold">Welcome</span>
            <span class="text-muted-color font-medium mb-20">{{
                currentUser?.name
            }}</span>

            <ul class="list-none m-0 p-0">
                <li>
                    <a
                        data-testid="profile-link"
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-user text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold">My Profile</span>
                        </div>
                    </a>
                </li>
                <li @click="showNotifications" :loading="true">
                    <a
                        :disabled="true"
                        data-testid="notifications-link"
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-user text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >Notifications</span
                            >
                        </div>
                    </a>
                </li>
                <li @click="openDialog('password')">
                    <a
                        :disabled="true"
                        data-testid="change-password-link"
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-lock text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >Change Password</span
                            >
                        </div>
                    </a>
                </li>
                <li @click="signOut" :loading="true">
                    <a
                        :disabled="true"
                        data-testid="logout-link"
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-power-off text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold">Sign Out</span>
                        </div>
                    </a>
                </li>
            </ul>
        </div>

        <div class="flex flex-col mt-20 mx-auto md:mx-0">
            <span class="mb-2 font-semibold">Notifications</span>
            <span class="text-muted-color font-medium mb-20"
                >You have 3 notifications</span
            >

            <ul class="list-none m-0 p-0">
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-comment text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >Your post has new comments</span
                            >
                            <p class="text-muted-color m-0">5 min ago</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-trash text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >Your post has been deleted</span
                            >
                            <p class="text-muted-color m-0">15min ago</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <i class="pi pi-folder text-xl text-primary"></i>
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >Post has been updated</span
                            >
                            <p class="text-muted-color m-0">3h ago</p>
                        </div>
                    </a>
                </li>
            </ul>
        </div>

        <div class="flex flex-col mt-20 mx-auto md:mx-0">
            <span class="mb-2 font-semibold">Messages</span>
            <span class="text-muted-color font-medium mb-20"
                >You have new messages</span
            >

            <ul class="list-none m-0 p-0">
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <img
                                src="/demo/images/avatar/circle/avatar-m-8.png"
                                alt="Avatar"
                                class="w-8/12 h-8"
                            />
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold"
                                >James Robinson</span
                            >
                            <p class="text-muted-color m-0">10 min ago</p>
                        </div>
                        <Badge value="3" class="ml-auto"></Badge>
                    </a>
                </li>
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <img
                                src="/demo/images/avatar/circle/avatar-f-8.png"
                                alt="Avatar"
                                class="w-8/12 h-8"
                            />
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold">Mary Watson</span>
                            <p class="text-muted-color m-0">15min ago</p>
                        </div>
                        <Badge value="1" class="ml-auto"></Badge>
                    </a>
                </li>
                <li>
                    <a
                        class="cursor-pointer flex border-surface mb-12 p-12 items-center border border-surface rounded-border hover:bg-emphasis transition-colors duration-150"
                    >
                        <span>
                            <img
                                src="/demo/images/avatar/circle/avatar-f-4.png"
                                alt="Avatar"
                                class="w-8/12 h-8"
                            />
                        </span>
                        <div class="ml-12">
                            <span class="mb-2 font-semibold">Aisha Webb</span>
                            <p class="text-muted-color m-0">3h ago</p>
                        </div>
                        <Badge value="2" class="ml-auto"></Badge>
                    </a>
                </li>
            </ul>
        </div>
    </Sidebar>

    <Dialog
        data-testid="change-password-dialog"
        v-model:visible="isDialogVisible"
        @update:visible="onShow"
        :header="dialogHeader"
        :style="{ width: '31vw' }"
        modal
        :closable="false"
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="p-dialog-title" data-testid="dialog-title">
                    <span v-if="dialogMode === 'password'">
                        {{ dialogHeader }}
                    </span>
                </div>
                <Button
                    icon="pi pi-times"
                    text
rounded
                    data-testid="dialog-close-button"
                    @click="closeDialog"
                    aria-label="Close"
                />
            </div>
        </template>
        <div v-if="dialogMode === 'password'">
            <div class="p-fluid formgrid grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
                <div class="field col-span-12 mb-12">
                    <label
                        data-testid="password-label"
                        class="block mb-2"
                        for="current-password"
                        >{{ $t('auth.current_password') }}</label
                    >
                    <InputField
                        data-testid="password-input"
                        id="current-password"
                        variant="password"
                        name="current-password"
                        toggleMask
                        value=""
                        :feedback="false"
                        v-model="formData.password"
                        autocomplete="new-password"
                    />
                </div>
                <div class="field col-span-12 mb-12">
                    <label
                        data-testid="new-password-label"
                        class="block mb-2"
                        for="new_password"
                        >{{ $t('auth.new_password') }}</label
                    >
                    <InputField
                        data-testid="new-password-input"
                        id="new_password"
                        variant="password"
                        toggleMask
                        :feedback="false"
                        v-model="formData.new_password"
                        @input="validatePassword"
                    />
                </div>
                <div class="field col-span-12 mb-12">
                    <label
                        data-testid="new-password-confirmation-label"
                        class="block mb-2"
                        for="new_password_confirmation"
                        >{{ $t('auth.confirm_new_password') }}</label
                    >
                    <InputField
                        data-testid="new-password-confirmation-input"
                        id="new_password_confirmation"
                        variant="password"
                        toggleMask
                        :feedback="false"
                        v-model="formData.new_password_confirmation"
                    />
                </div>
                <div class="field col-span-12">
                    <label
                        class="font-semibold mb-12"
                        data-testid="password-rules-label"
                    >
                        {{ t('auth.password_contain_label') }}:
                    </label>
                    <div class="password-rules">
                        <div
                            :class="[
                                'font-light relative flex gap-12 rule',
                                {
                                    valid: rules.minLength,
                                    invalid: !rules.minLength
                                }
                            ]"
                            data-testid="password-rule-min-length"
                        >
                            {{ t('auth.validation_min_length') }}
                        </div>
                        <div
                            :class="[
                                'font-light relative flex gap-12 rule',
                                {
                                    valid: rules.uppercase,
                                    invalid: !rules.uppercase
                                }
                            ]"
                            data-testid="password-rule-uppercase"
                        >
                            {{ t('auth.validation_uppercase') }}
                        </div>
                        <div
                            :class="[
                                'font-light relative flex gap-12 rule',
                                {
                                    valid: rules.lowercase,
                                    invalid: !rules.lowercase
                                }
                            ]"
                            data-testid="password-rule-lowercase"
                        >
                            {{ t('auth.validation_lowercase') }}
                        </div>
                        <div
                            :class="[
                                'font-light relative flex gap-12 rule',
                                {
                                    valid: rules.number,
                                    invalid: !rules.number
                                }
                            ]"
                            data-testid="password-rule-number"
                        >
                            {{ t('auth.validation_number') }}
                        </div>
                        <div
                            :class="[
                                'font-light relative flex gap-12 rule',
                                {
                                    valid: rules.symbol,
                                    invalid: !rules.symbol
                                }
                            ]"
                            data-testid="password-rule-symbol"
                        >
                            {{
                                t('auth.validation_symbol').replace(
                                    '\\u0040',
                                    '@'
                                )
                            }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="dialogMode === 'verify'">
            <h4 class="font-bold text-3xl text-center" data-testid="page-title">
                {{ $t('auth.otp_verifications') }}
            </h4>
            <p class="text-center pt-2 pb-2" data-testid="page-subtitle">
                {{ verificationMessage }}
            </p>
            <div class="pt-12 grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 p-fluid formgrid">
                <div class="field col-span-12 mb-20">
                    <OtpInput
                        :key="otpKey"
                        input-classes="otp-input"
                        inputType="number"
                        :num-inputs="6"
                        v-model:value="verifyFormData.code"
                        data-testid="otp-input"
                        :should-auto-focus="true"
                        :should-focus-order="true"
                    />
                </div>
            </div>
            <div class="flex items-center justify-center mb-20">
                <div class="flex items-center text-base font-bold">
                    <span
                        class="d-flex text-surface-600 dark:text-surface-200"
                        data-testid="not-receive-text"
                    >
                        {{ $t('auth.no_code_receive') }}
                    </span>
                    <Button
                        data-testid="resend-button"
                        text
                        class="px-1 py-1 underline text-base text-primary"
                        size="small"
                        :loading="busy"
                        @click="requestPasswordChange"
                        :label="$t('buttons.resend')"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <div v-if="dialogMode === 'password'">
                <Button
                    data-testid="cancel-button"
                    class="p-button-outlined"
                    :label="$t('buttons.cancel')"
                    @click="closeDialog"
                />
                <Button
                    :disabled="!isPasswordValid"
                    data-testid="continue-button"
                    :label="$t('buttons.continue')"
                    @click="requestPasswordChange"
                    :loading="busy"
                />
            </div>
            <div v-else-if="dialogMode === 'verify'">
                <Button
                    data-testid="cancel-button"
                    class="p-button-outlined"
                    :label="$t('buttons.cancel')"
                    @click="dialogMode = 'password'"
                />
                <Button
                    icon="pi pi-check"
                    data-testid="verify-button"
                    :label="$t('buttons.verify')"
                    @click="verifyCode"
                    :loading="verifying"
                    :disabled="!isCodeValid"
                />
            </div>
        </template>
    </Dialog>
</template>
<style>
.otp-input-container {
    gap: 1rem;
    justify-content: center;
    padding-inline: 0.35rem;
}

.otp-input {
    width: 50px;
    height: 54px;
    padding: 5px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    text-align: center;
    font-size: 1.1rem;
    outline: none;
}

.otp-input:hover {
    border-color: #14377d;
}
p {
    margin-top: 1px;
}
.rule {
    margin-bottom: 0.75rem;
}
.rule::before {
    font-family: 'primeicons';
    font-size: 1.15rem;
}
.valid,
.valid::before {
    color: #0e4f26;
}
.valid::before {
    content: '\e909';
}
.invalid,
.invalid::before {
    color: #b32b23;
}
.invalid::before {
    content: '\e90b';
}
</style>
