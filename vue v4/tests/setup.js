import { config, DOMWrapper } from '@vue/test-utils';
import { afterEach, vi } from 'vitest';
import { plugins, components, directives } from '../src/plugins';

const DataTestIdPlugin = (wrapper) => {
    function findByTestId(selector) {
        const dataSelector = `[data-testid='${selector}']`;
        const element = wrapper.element.querySelector(dataSelector);
        if (element) {
            return new DOMWrapper(element);
        } else {
            // Return a minimal wrapper with exists() method that returns false
            return {
                exists: () => false,
                text: () => '',
                attributes: () => ({}),
                find: () => ({ exists: () => false }),
                findAll: () => []
            };
        }
    }

    return {
        findByTestId
    };
};

config.global.fetch = async () => {};
config.plugins.VueWrapper.install(DataTestIdPlugin);
config.global.plugins = plugins;
config.global.components = components;
config.global.directives = directives;
config.global.provide = directives;

// Cleanup after each test
afterEach(() => {
    // Clear all active timers
    if (global.clearAllActiveTimers) {
        global.clearAllActiveTimers();
    }
    vi.clearAllTimers();
    vi.clearAllMocks();
});

vi.mock('firebase/messaging', () => {
    return {
        getMessaging: vi.fn(() => ({
            getToken: vi.fn().mockResolvedValue('mockToken'),
            onMessage: vi.fn(),
            deleteToken: vi.fn().mockResolvedValue()
        })),
        setBackgroundMessageHandler: vi.fn()
    };
});
