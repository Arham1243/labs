<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const loading = ref(false);
const email = ref(null);

const handleSubmit = async () => {
    try {
        loading.value = true;
        const res = await authStore.forgotPassword({ email: email.value });
        if (res.status === true) {
            email.value = '';
        }
    } catch (e) {
        // Handle error
    } finally {
        loading.value = false;
    }
};
const goBack = () => {
    router.push({ name: 'Login' });
};
</script>
<template>
    <h4 class="font-bold text-3xl text-center" data-testid="page-title">
        {{ t('auth.forgot_password') }}
    </h4>
    <p class="pt-3 text-center mb-6" data-testid="page-subtitle">
        {{ t('auth.forgot_password_message') }}
    </p>
    <form @submit.prevent="handleSubmit">
        <div class="p-fluid formgrid grid">
            <div class="field col-12 mb-5">
                <label
                    data-testid="email-label"
                    class="block mb-2"
                    for="email"
                    >{{ $t('auth.email') }}</label
                >
                <InputField
                    id="email"
                    data-testid="email-input"
                    data-testid-icon="email-icon"
                    variant="text"
                    class="w-full"
                    v-model="email"
                />
            </div>
        </div>
        <Button
            :label="t('buttons.continue')"
            class="flex-auto w-full"
            :loading="loading"
            @click="handleSubmit"
            data-testid="continue-button"
            type="submit"
        />
        <Button
            :label="t('auth.back_to_login')"
            class="p-button-outlined w-full mt-3"
            @click="goBack"
            data-testid="back-to-login-button"
            type="button"
        />
    </form>
</template>
