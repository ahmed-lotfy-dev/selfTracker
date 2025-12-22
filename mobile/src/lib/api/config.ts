import Constants, { ExecutionEnvironment } from "expo-constants";

export const API_BASE_URL = "https://selftracker.ahmedlotfy.site";

/**
 * The scheme used for authentication redirects.
 * In Expo Go, we let Expo handle it (which uses 'exp').
 * In Standalone/Dev Build, we use 'selftracker'.
 */
// Constants.appOwnership is deprecated but sometimes more reliable in older contexts.
// However, let's stick to the modern one but handle the case where it might be undefined/different.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export const AUTH_SCHEME = isExpoGo ? undefined : "selftracker";



