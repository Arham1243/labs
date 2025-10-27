import { defineStore } from 'pinia';
import { useCookies } from 'vue3-cookies';
import { updateAbility } from '@/plugins/ability';
import { ref } from 'vue';
import { AuthService } from '@/services';

export const useSessionStore = defineStore('SessionStore', () => {
    const { cookies } = useCookies();
    const user = ref(null);
    const permissions = ref([]);
    const menuItems = ref([]);
    const settings = ref([]);
    const intendedRoute = ref(sessionStorage.getItem('intendedRoute'));

    const startUserSession = (data) => {
        const date = new Date();

        const authCookie = getCookie() || {};

        authCookie.access_token = data.access_token;
        authCookie.expires_in = date.setSeconds(
            date.getSeconds() + data.expires_in
        );

        if (data.refresh_token) {
            authCookie.refresh_token = data.refresh_token;
        }

        setCookie(authCookie);
    };

    const clearSessionState = () => {
        cookies.remove('horus_cookie', null);
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('phone');
        sessionStorage.removeItem('method');
        cookies.remove('remember_me', null);

        user.value = null;
        permissions.value = [];
        menuItems.value = [];
    };

    const setCookie = (value) => {
        cookies.set('horus_cookie', value, '7d');
    };

    const getCookie = () => {
        return cookies.get('horus_cookie');
    };

    const setEmail = (value) => {
        sessionStorage.setItem('email', value);
    };

    const setRememberMe = (value) => {
        if (value) {
            cookies.set('remember_me', '1', '7d');
        } else {
            cookies.remove('remember_me');
        }
    };

    const setPhone = (value) => {
        sessionStorage.setItem('phone', value);
    };

    const setMethod = (value) => {
        sessionStorage.setItem('method', value);
    };

    const getEmail = () => {
        return sessionStorage.getItem('email');
    };

    const getRememberMe = () => {
        const value = cookies.get('remember_me');
        return value === '1';
    };

    const getPhone = () => {
        return sessionStorage.getItem('phone');
    };

    const getMethod = () => {
        return sessionStorage.getItem('method');
    };

    const me = async () => {
        const res = (await AuthService.me()).data;
        user.value = res.data;
        permissions.value = res.permissions;
        menuItems.value = res.menu_items;
        settings.value = res.settings;
        updateAbility(permissions.value);

        return user.value;
    };

    const setIntended = (route) => {
        intendedRoute.value = route;
        sessionStorage.setItem('intendedRoute', route);
    };

    const consumeIntended = () => {
        const route = intendedRoute.value;
        intendedRoute.value = null;
        sessionStorage.removeItem('intendedRoute');
        return route;
    };

    return {
        startUserSession,
        clearSessionState,
        me,
        user,
        permissions,
        menuItems,
        settings,

        setEmail,
        setPhone,
        setMethod,
        setRememberMe,
        setCookie,
        getCookie,

        getEmail,
        getPhone,
        getMethod,
        getRememberMe,

        setIntended,
        consumeIntended
    };
});
