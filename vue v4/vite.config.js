// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import * as path from 'path';
import { configDefaults } from 'vitest/config';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
    // optimizeDeps: {
    //     noDiscovery: true,
    //     include: ['quill']
    // },
    plugins: [
        vue(),
        VueI18nPlugin({
            include: ['./src/lang/**/*.json', './src/modules/*/lang/**/*.json'],
            strictMessage: false
        }),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: true, // listen on all interfaces
        port: 3000,
        // allow the herd‐proxied hostname:
        allowedHosts: ['app.horus.test']
    },
    test: {
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                resources: 'usable'
            }
        },
        globals: true,
        include: ['src/**/*.{test,spec}.{js,ts,vue}'],
        exclude: [...configDefaults.exclude, 'node_modules/', 'dist/'],
        setupFiles: ['./tests/setup_env.js', './tests/setup.js'],
        testTimeout: 30000,
        mockRestore: true,
        teardownTimeout: 10000,
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'lcov', 'html'],
            all: false,
            exclude: ['node_modules/', 'dist/'],
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        pool: 'threads',
        isolate: true,
        maxWorkers: 2,
        minWorkers: 1,
        hookTimeout: 30000,
        watch: false,
        resolve: {
            alias: {
                'firebase/messaging': path.resolve(
                    dirname(fileURLToPath(import.meta.url)),
                    './tests/mocks/firebase.mocks.js'
                )
            }
        }
    }
});
