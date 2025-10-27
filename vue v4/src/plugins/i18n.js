import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import { merge } from 'lodash'; // Optional, for deep merging

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    availableLocales: ['en', 'fr'],
    messages
});

export const useGlobalI18n = () => i18n.global.t;

export const { t, locale, fallbackLocale } = i18n.global;

export const loadAndAddLocaleMessages = async (locale, path) => {
    let additionalMessages;

    try {
        additionalMessages = await import(/* @vite-ignore */ path);
    } catch (error) {
        console.error(`Failed to load locale messages for ${locale}:`, error);
        return;
    }

    const currentMessages = i18n.global.getLocaleMessage(locale);

    const mergedMessages = merge(
        {},
        currentMessages,
        additionalMessages.default
    );

    console.log(mergedMessages);

    i18n.global.setLocaleMessage(locale, mergedMessages);
};
