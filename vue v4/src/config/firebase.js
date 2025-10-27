import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

let app = null;
let messaging = null;

// Cache keys and current version
const CACHE_KEYS = {
    CONFIG: 'firebaseConfig',
    VERSION: 'cacheVersion'
};
const CURRENT_VERSION = import.meta.env.VITE_CACHE_VERSION || 'v1';

/**
 * Retrieves the cached Firebase configuration if it matches the current version.
 * @returns {Object|null} The cached Firebase configuration, or null if invalid.
 */
const getCachedConfig = () => {
    const cachedVersion = localStorage.getItem(CACHE_KEYS.VERSION);
    const cachedConfig = localStorage.getItem(CACHE_KEYS.CONFIG);

    if (cachedVersion !== CURRENT_VERSION) {
        clearCache();
        return null;
    }

    return cachedConfig ? JSON.parse(cachedConfig) : null;
};

/**
 * Fetches the Firebase configuration from the server and caches it locally.
 * @returns {Promise<Object>} The fetched Firebase configuration.
 * @throws {Error} If the fetch fails.
 */
const fetchConfig = async () => {
    const response = await fetch('/firebase-auth.json');
    if (!response.ok) {
        console.error(
            `Failed to fetch Firebase config: ${response.statusText}`
        );
    }

    const config = await response.json();
    cacheConfig(config);
    return config;
};

/**
 * Caches the Firebase configuration and version.
 * @param {Object} config - The Firebase configuration to cache.
 */
const cacheConfig = (config) => {
    localStorage.setItem(CACHE_KEYS.CONFIG, JSON.stringify(config));
    localStorage.setItem(CACHE_KEYS.VERSION, CURRENT_VERSION);
};

/**
 * Clears the cached Firebase configuration and version.
 */
const clearCache = () => {
    localStorage.removeItem(CACHE_KEYS.CONFIG);
    localStorage.removeItem(CACHE_KEYS.VERSION);
};

/**
 * Initializes the Firebase app and messaging service.
 * @param {Object} config - The Firebase configuration.
 */
const initializeAppAndMessaging = (config) => {
    if (!app) {
        app = initializeApp(config);
        messaging = getMessaging(app);
    }
};

/**
 * Initializes Firebase by loading the configuration, either from cache or by fetching it.
 */
const initializeFirebase = async () => {
    let firebaseConfigCache = getCachedConfig();

    if (!firebaseConfigCache) {
        firebaseConfigCache = await fetchConfig();
    }

    try {
        initializeAppAndMessaging(firebaseConfigCache);
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
};

// Initialize Firebase
initializeFirebase();

export { messaging };
