import { describe, expect, it, vi } from 'vitest';
import * as indexExports from '@/plugins/index';
import { i18n, loadAndAddLocaleMessages } from '@/plugins/i18n';

// Mock the imports
vi.mock('../stores', () => ({}), { virtual: true });
vi.mock('../routes', () => ({}), { virtual: true });
vi.mock(
    './i18n',
    () => ({
        i18n: { global: {} },
        loadAndAddLocaleMessages: vi.fn()
    }),
    { virtual: true }
);
vi.mock('../utils', () => ({}), { virtual: true });
vi.mock(
    '@casl/vue',
    () => ({
        abilitiesPlugin: {}
    }),
    { virtual: true }
);
vi.mock(
    '@/plugins/ability',
    () => ({
        ability: {}
    }),
    { virtual: true }
);

// Mock PrimeVue and other UI libraries
vi.mock('primevue/config', () => ({}), { virtual: true });
vi.mock('primevue/dialogservice', () => ({}), { virtual: true });
vi.mock('primevue/toastservice', () => ({}), { virtual: true });
vi.mock('primevue/confirmationservice', () => ({}), { virtual: true });
vi.mock('vue-tel-input', () => ({}), { virtual: true });

// Mock CSS imports
vi.mock('@/assets/styles.scss', () => ({}), { virtual: true });
vi.mock('vue-tel-input/vue-tel-input.css', () => ({}), { virtual: true });

// Mock all PrimeVue components and directives
vi.mock('primevue/ripple', () => ({}), { virtual: true });
vi.mock('primevue/tooltip', () => ({}), { virtual: true });
vi.mock('primevue/badgedirective', () => ({}), { virtual: true });
vi.mock('primevue/styleclass', () => ({}), { virtual: true });
vi.mock('primevue/autocomplete', () => ({}), { virtual: true });
vi.mock('primevue/accordion', () => ({}), { virtual: true });
vi.mock('primevue/accordiontab', () => ({}), { virtual: true });
// ... and so on for all other PrimeVue components

describe('Plugins Index', () => {
    it('exports i18n functions from i18n.js', () => {
        // Check that the exports from i18n.js are re-exported
        expect(indexExports.i18n).toBe(i18n);
        expect(indexExports.loadAndAddLocaleMessages).toBe(
            loadAndAddLocaleMessages
        );
    });

    it('exports i18n-related functions and objects', () => {
        // Check that the exports exist and are of the expected type
        expect(indexExports).toBeDefined();
        expect(indexExports.i18n).toBeDefined();
        expect(indexExports.loadAndAddLocaleMessages).toBeDefined();
        expect(typeof indexExports.loadAndAddLocaleMessages).toBe('function');
    });
});
