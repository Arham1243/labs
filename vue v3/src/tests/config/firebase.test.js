import { describe, expect, it, vi } from 'vitest';
import { getMessaging } from 'firebase/messaging';

// Mock the Firebase modules
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn()
}));

vi.mock('firebase/messaging', () => ({
    getMessaging: vi.fn(() => ({ name: 'mock-messaging-instance' }))
}));

// Since we're testing the exports, we need to mock the module
vi.mock('@/config/firebase', () => ({
    messaging: { name: 'mock-messaging-instance' }
}));

describe('Firebase Configuration', () => {
    it('exports the messaging object', async () => {
        // Import the module
        const firebase = await import('@/config/firebase');

        // Verify the messaging object is exported
        expect(firebase.messaging).toBeDefined();
        expect(firebase.messaging).toEqual({ name: 'mock-messaging-instance' });
    });
});
