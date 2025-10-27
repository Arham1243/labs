<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore, useSessionStore } from '@/stores';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import OtpInput from 'vue3-otp-input';

const props = defineProps({
    isSms: {
        type: Boolean,
        required: false
    }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();

const loading = ref(false);
const isSendingOtp = ref(false);
const isResendingOtp = ref(false);
const otpKey = ref('');
const code = ref('');
const session = ref(route.query.session);
const method = sessionStore.getMethod();

const verificationMessage = computed(() => {
    const formattedMethod = method === 'sms' ? 'SMS' : method;
    const contactInfo =
        method === 'sms' ? sessionStore.getPhone() : sessionStore.getEmail();
    return (
        t('auth.verify_code_message', { method: formattedMethod }) +
        ' ' +
        contactInfo
    );
});

const isCodeValid = computed(() => {
    return code.value.length === 6;
});

const pushRoute = (name, query = {}) => {
    router.push({ name, query });
};

const verifyCode = async () => {
    try {
        loading.value = true;
        const payload = {
            code: code.value,
            session: session.value
        };
        await authStore.verifyCode(payload);
        sessionStorage.removeItem('email');
        const url = sessionStore.consumeIntended() || 'Dashboard';
        router.push(url);
    } catch (e) {
        if (
            e.response.status === 400 &&
            e.response.data.challenge === 'VERIFICATION_REQUIRED'
        ) {
            session.value = e.response.data.session;
            router.replace({
                query: {
                    ...route.query,
                    session: session.value
                }
            });
        }
    } finally {
        loading.value = false;
    }
};

const handleSendOtp = async (method, isResend = false) => {
    try {
        if (isResend) {
            isResendingOtp.value = true;
        } else {
            isSendingOtp.value = true;
        }

        const payload = {
            token: session.value,
            auth_challenge_type: method
        };

        const res = await authStore.resendLoginOtp(payload);
        session.value = res.data.session;

        if (method === 'sms') {
            sessionStore.setPhone(res.data.phone_number);
        }

        router.replace({
            query: {
                ...route.query,
                session: session.value
            }
        });

        const routeName =
            method === 'sms' ? 'Verify SMS Code' : 'Verify Email Code';
        pushRoute(routeName, { session: session.value });
    } catch (error) {
        //
    } finally {
        isSendingOtp.value = false;
        isResendingOtp.value = false;
        otpKey.value = Date.now();
        code.value = '';
    }
};
</script>
<template>
    <div>
        <h4
            class="text-[1.75rem] font-bold text-center"
            data-testid="page-title"
        >
            {{ $t('auth.otp_verifications') }}
        </h4>
        <p class="text-center py-2 mb-4" data-testid="page-subtitle">
            {{ verificationMessage }}
        </p>
        <form @submit.prevent="verifyCode">
            <div class="pt-4 grid gap-6">
                <div class="col-span-12 mb-[1.88rem]">
                    <OtpInput
                        :key="otpKey"
                        input-classes="otp-input"
                        inputType="number"
                        :num-inputs="6"
                        v-model:value="code"
                        data-testid="otp-input"
                        :should-auto-focus="true"
                        :should-focus-order="true"
                    />
                </div>
            </div>
            <div class="flex items-center justify-center mb-[1.8rem]">
                <div class="flex items-center text-base font-bold">
                    <span
                        class="text-[#757575]"
                        data-testid="not-receive-text"
                    >
                        {{ $t('auth.no_code_receive') }}
                    </span>
                    <Button
                        data-testid="resend-button"
                        text
                        class="!p-1 underline !text-base text-primary"
                        size="small"
                        :loading="isResendingOtp"
                        @click="handleSendOtp(method, true)"
                        :label="$t('buttons.resend')"
                    />
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <Button
                    :disabled="!isCodeValid || loading"
                    data-testid="verify-button"
                    :label="$t('buttons.verify')"
                    class="w-ful left-loading"
                    :loading="loading"
                    type="submit"
                />
                <Button
                    v-if="!props.isSms"
                    data-testid="verify-button"
                    :label="$t('auth.send_otp_via_sms')"
                    variant="outlined"
                    class="w-full left-loading"
                    :loading="isSendingOtp"
                    @click="handleSendOtp('sms')"
                ></Button>
                <Button
                    v-else
                    data-testid="verify-button"
                    :label="$t('auth.send_otp_via_email')"
                    variant="outlined"
                    class="w-full"
                    :loading="isSendingOtp"
                    @click="handleSendOtp('email')"
                ></Button>
            </div>
        </form>
    </div>
</template>
<style>
.otp-input-container {
    gap: 1rem;
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
</style>
