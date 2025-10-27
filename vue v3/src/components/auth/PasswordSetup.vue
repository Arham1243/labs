<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const formData = ref({
    password: '',
    password_confirmation: '',
    phone_number: ''
});
const rules = ref({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
    passwordsMatch: false
});

const validatePassword = () => {
    const password = formData.value.password;

    rules.value.minLength = password.length >= 8;
    rules.value.uppercase = /[A-Z]/.test(password);
    rules.value.lowercase = /[a-z]/.test(password);
    rules.value.number = /[0-9]/.test(password);
    rules.value.symbol = /[@$!%*#?&]/.test(password);
};

const isPasswordValid = computed(
    () =>
        rules.value.minLength &&
        rules.value.uppercase &&
        rules.value.lowercase &&
        rules.value.number &&
        rules.value.symbol
);

const handleSubmit = async () => {
    try {
        loading.value = true;
        const payload = {
            ...formData.value
        };
        const params = {
            token: route.query.token
        };
        await authStore.setupPassword(payload, params);
        pushRoute('Dashboard');
    } catch (e) {
        // Handle error
    } finally {
        loading.value = false;
    }
};

const pushRoute = (name) => {
    router.push({ name });
};
</script>
<template>
    <div>
        <h4
            class="font-bold text-3xl text-center mb-6"
            data-testid="page-title"
        >
            {{ t('auth.setup_new_password') }}
        </h4>
        <form @submit.prevent="handleSubmit">
            <div class="p-fluid formgrid grid">
                <div class="field col-12 mb-4">
                    <label
                        data-testid="password-label"
                        class="block mb-2"
                        for="password"
                        >{{ $t('auth.password') }}</label
                    >
                    <InputField
                        id="password"
                        variant="password"
                        data-testid="password-input"
                        data-testid-icon="password-icon"
                        v-model="formData.password"
                        class="w-full"
                        toggleMask
                        :feedback="false"
                        @input="validatePassword"
                    />
                </div>
                <div class="field col-12 mb-4">
                    <label
                        data-testid="confirm-password-label"
                        class="block mb-2"
                        for="confirm_password"
                        >{{ $t('auth.confirm_password') }}</label
                    >
                    <InputField
                        data-testid="confirm-password-input"
                        data-testid-icon="confirm_password-icon"
                        id="confirm_password"
                        variant="password"
                        v-model="formData.password_confirmation"
                        class="w-full"
                        toggleMask
                        :feedback="false"
                    />
                </div>
                <div class="field col-12 mb-4">
                    <label
                        data-testid="phone-number-label"
                        class="block mb-2"
                        for="phone_number"
                        >{{ $t('auth.confirm_phone_number') }}</label
                    >
                    <InputField
                        data-testid="phone-number-input"
                        id="phone_number"
                        variant="phone"
                        v-model="formData.phone_number"
                        class="w-full"
                    />
                </div>
                <div class="field col-12">
                    <label
                        class="font-semibold mb-4"
                        data-testid="password-rules-label"
                    >
                        {{ t('auth.password_contain_label') }}:
                    </label>
                    <div class="password-rules">
                        <div
                            :class="[
                                'font-light relative flex gap-3 rule',
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
                                'font-light relative flex gap-3 rule',
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
                                'font-light relative flex gap-3 rule',
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
                                'font-light relative flex gap-3 rule',
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
                                'font-light relative flex gap-3 rule',
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
            <div class="pt-2">
                <div class="flex flex-wrap gap-2 justify-content-between">
                    <Button
                        data-testid="set-password-button"
                        :label="t('auth.set_password')"
                        class="w-full"
                        :loading="loading"
                        :disabled="!isPasswordValid"
                        type="submit"
                    />
                </div>
            </div>
        </form>
    </div>
</template>
<style lang="scss" scoped>
p {
    margin-top: 1px;
}
.rule {
    margin-bottom: 0.75rem;
}

.continue {
    padding-top: 6px;
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
