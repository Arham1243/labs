<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const credentials = ref({
    email: '',
    password: '',
    remember_me: false,
    auth_challenge_type: 'email'
});

const pushRoute = (name, query = {}) => {
    router.push({ name, query });
};

const login = async () => {
    try {
        loading.value = true;
        const res = await authStore.login(credentials.value);
        if (res.data.challenge === 'NEW_PASSWORD_REQUIRED') {
            const session = res.data.session;
            pushRoute('Password Setup', { session });
        } else if (res.data.challenge === 'VERIFICATION_REQUIRED') {
            const session = res.data.session;
            pushRoute('Verify Email Code', { session });
        }
    } catch (e) {
        // Handle error
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <h4
            class="text-[1.75rem] font-bold text-center mb-12"
            data-testid="page-title"
        >
            {{ t('auth.log_in') }}
        </h4>
        <form @submit.prevent="login">
            <div class="grid">
                <div class="mb-6 col-span-12">
                    <label
                        data-testid="email-label"
                        class="block mb-2"
                        for="email"
                    >
                        {{ $t('auth.email') }}
                    </label>
                    <InputField
                        data-testid="email-input"
                        data-testid-icon="email-icon"
                        id="email"
                        variant="text"
                        v-model="credentials.email"
                        class="w-full"
                    />
                </div>

                <div class="mb-4 col-span-12">
                    <label
                        data-testid="password-label"
                        class="block mb-2"
                        for="password"
                    >
                        {{ $t('auth.password') }}
                    </label>
                    <InputField
                        id="password"
                        variant="password"
                        data-testid="password-input"
                        data-testid-icon="password-icon"
                        v-model="credentials.password"
                        class="w-full"
                        inputClass="w-full"
                        toggleMask
                        :feedback="false"
                    />
                </div>
            </div>

            <div class="flex justify-between items-center pt-1 pb-[2.05rem]">
                <div class="flex items-center">
                    <InputField
                        data-testid="rememberme-checkbox"
                        inputId="remember"
                        variant="checkbox"
                        binary
                        v-model="credentials.remember_me"
                        size="large"
                    />
                    <label
                        for="remember"
                        data-testid="rememberme-text"
                        class="ml-2 cursor-pointer"
                    >
                        {{ t('auth.remember_me') }}
                    </label>
                </div>

                <router-link
                    data-testid="forgot-password-link"
                    :to="{ name: 'Password Reset Request' }"
                >
                    {{ t('auth.forgot_password') }}
                </router-link>
            </div>
            <Button
                :disabled="loading"
                data-testid="login-button"
                class="w-full left-loading"
                :label="t('auth.log_in')"
                :loading="loading"
                type="submit"
            />
        </form>
    </div>
</template>