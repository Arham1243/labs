// tests/mocks/firebase.mocks.js
export const getMessaging = vi.fn(() => ({
    getToken: vi.fn().mockResolvedValue('mockToken'),
    onMessage: vi.fn(),
    deleteToken: vi.fn().mockResolvedValue()
}));

export const initializeApp = vi.fn();
export const messaging = vi.fn(() => ({
    getToken: vi.fn().mockResolvedValue('mockToken'),
    onMessage: vi.fn(),
    deleteToken: vi.fn().mockResolvedValue()
}));
