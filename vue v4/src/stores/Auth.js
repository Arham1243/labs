import { defineStore } from 'pinia';
import { AuthService } from '@/services';
import { useGlobalStore, useSessionStore } from '@/stores';
import { useI18n } from 'vue-i18n';

export const useAuthStore = defineStore('AuthStore', () => {
    const globalStore = useGlobalStore();
    const sessionStore = useSessionStore();
    const { t } = useI18n();

    const login = (payload) => {
        return globalStore.actionWrapper(async () => {
            const { email, auth_challenge_type, remember_me } = payload;
            const res = await AuthService.login(payload);

            sessionStore.setEmail(email);
            sessionStore.setMethod(auth_challenge_type);
            sessionStore.setRememberMe(remember_me);

            const type = auth_challenge_type === 'sms' ? 'sms' : 'email';
            globalStore.showSuccess(
                t(`notifications.otp_sent_via_${type}`),
                t(`notifications.otp_sent_via_${type}_detail`)
            );
            return res.data;
        });
    };

    const resendLoginOtp = (payload) => {
        return globalStore.actionWrapper(async () => {
            const { auth_challenge_type, remember_me } = payload;
            const res = await AuthService.resendLoginOtp(payload);

            sessionStore.setMethod(auth_challenge_type);
            sessionStore.setRememberMe(remember_me);

            const type = auth_challenge_type === 'sms' ? 'sms' : 'email';
            globalStore.showSuccess(
                t(`notifications.otp_sent_via_${type}`),
                t(`notifications.otp_sent_via_${type}_detail`)
            );
            return res.data;
        });
    };

    const verifyCode = (payload) => {
        const data = {
            ...payload,
            remember_me: sessionStore.getRememberMe()
        };
        return globalStore.actionWrapper(async () => {
            const res = await AuthService.verifyCode(data);
            sessionStore.startUserSession(res.data);
            return res.data;
        });
    };

    const setupPassword = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AuthService.setupPassword(payload, params);
            sessionStore.startUserSession(res.data.data);
            return res.data;
        });
    };

    const forgotPassword = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AuthService.forgotPassword(payload);
            sessionStore.setEmail(payload.email);
            sessionStore.setMethod('email');
            globalStore.showSuccess(
                t('notifications.password_reset_link_sent'),
                t('notifications.password_reset_link_sent_detail')
            );
            return res.data;
        });
    };

    const resendForgotPasswordCode = () => {
        const payload = {
            email: sessionStore.getEmail()
        };
        return globalStore.actionWrapper(async () => {
            const res = await AuthService.forgotPassword(payload);
            return res.data;
        });
    };

    const resetPassword = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AuthService.resetPassword(payload, params);
            globalStore.showSuccess(
                t('notifications.password_changed'),
                t('notifications.password_changed_detail')
            );
            return res.data;
        });
    };

    const logout = async () => {
        const res = await AuthService.logout();
        const sessionStore = useSessionStore();
        sessionStore.clearSessionState();
        return res.data;
    };

    const requestPasswordChange = async (payload) => {
        try {
            const res = await AuthService.requestPasswordChange(payload);
            globalStore.showSuccess(
                t('notifications.otp_sent_via_email'),
                t('notifications.otp_sent_via_email_detail')
            );
            return res.data;
        } catch (error) {
            globalStore.showError(
                t('notifications.oops'),
                error.response.data.message
            );
        }
    };

    const verifyPasswordCode = async (payload) => {
        try {
            const res = await AuthService.verifyPasswordCode(payload);
            globalStore.showSuccess(
                t('notifications.password_changed'),
                t('notifications.password_changed_detail')
            );
            return res.data;
        } catch (error) {
            globalStore.showError(
                t('notifications.oops'),
                error.response.data.message
            );
        }
    };

    return {
        login,
        resendLoginOtp,
        logout,
        requestPasswordChange,
        verifyPasswordCode,
        setupPassword,
        forgotPassword,
        resendForgotPasswordCode,
        resetPassword,
        verifyCode
    };
});
