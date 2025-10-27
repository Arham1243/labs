import { vi } from 'vitest';

vi.stubEnv('VITE_API_BASE_URL', '123465897');

// Mock browser APIs on window (jsdom provides window)
if (typeof window !== 'undefined') {
    window.URL.createObjectURL = vi.fn(() => 'mock-url');
    window.URL.revokeObjectURL = vi.fn();
}

class MockXMLHttpRequest {
    constructor() {
        this.open = vi.fn();
        this.send = vi.fn();
        this.setRequestHeader = vi.fn();
        this.readyState = 4;
        this.status = 200;
        this.responseText = '{}';
        this.onreadystatechange = null;
    }
}
global.XMLHttpRequest = MockXMLHttpRequest;

global.fetch = vi.fn(async (url) => {
    if (url === '/firebase-auth.json') {
        return {
            ok: true,
            json: async () => ({
                apiKey: 'mockApiKey',
                authDomain: 'mockAuthDomain',
                projectId: 'mockProjectId',
                storageBucket: 'mockStorageBucket',
                messagingSenderId: 'mockMessagingSenderId',
                appId: 'mockAppId',
                measurementId: 'mockMeasurementId'
            }),
            clone: vi.fn().mockImplementation(function () {
                return this;
            })
        };
    }
    throw new Error(`Unhandled request: ${url}`);
});

global.caches = {
    open: vi.fn().mockResolvedValue({
        add: vi.fn(),
        put: vi.fn(),
        match: vi.fn()
    }),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn()
};
