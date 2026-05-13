# Mobile App — Session Token & Sync Fixes (May 2026)

## Problem
1. **Token expiry caused data loss**: When the better-auth session token expired, ElectricSync requests failed with 401 silently. Users couldn't sync data to the server. When they finally logged out, `clearDatabase()` deleted the entire local SQLite file, and since data never synced to the server, it was gone forever.
2. **No token refresh mechanism**: The app stored the token manually in SecureStore/Zustand but never refreshed it.
3. **No connection pooling**: Backend used a single DB connection string, risking Neon connection limit exhaustion.

## Changes Made

### 1. `mobile/src/lib/api/axiosInstance.ts`
- Added axios response interceptor: on 401 → calls `authClient.getSession()` to refresh token → retries original request
- If refresh fails → clears tokens, navigates to `/(auth)/sign-in` (forces re-login before user can logout and lose data)
- Queue system: multiple simultaneous 401s are batched and retried together after single refresh
- `_retry` flag prevents infinite loops

### 2. `mobile/src/db/client.ts` (ElectricSync)
- On 401 stream error: attempts token refresh via `authClient.getSession()`
- If refresh succeeds → updates token in store, creates new ShapeStream
- If refresh fails → marks table as `'auth_required'` for UI feedback

### 3. `mobile/src/services/SyncManager.ts`
- **Changed `clearDatabase()` from hard delete to soft delete**
- Before: `SQLite.deleteDatabaseAsync()` — destroyed the entire DB file
- After: `DELETE FROM` each table — clears data but preserves DB structure for reuse
- Rationale: logout should allow multi-account switching without data loss; data on server is preserved

### 4. `mobile/src/stores/useSyncStore.ts`
- Added `'auth_required'` sync status to distinguish auth failures from network errors

### 5. `mobile/src/hooks/useTokenRefresh.ts` (NEW)
- Runs hourly via `useEffect` to validate session
- If session invalid → marks sync tables as `auth_required`
- Integrated in `RootProvider.tsx`

### 6. `mobile/src/components/Provider/RootProvider.tsx`
- Added `useTokenRefresh()` hook import and call

### 7. `mobile/src/components/features/profile/SyncSection.tsx`
- Shows "Session Expired" warning with Re-login button when token is expired
- Fixed `showAlert()` call to use individual parameters (was passing object, causing TS error)

### 8. `mobile/src/types/better-auth.d.ts` (NEW)
- Type declarations for `better-auth/react`, `@better-auth/expo/client`, `better-auth/client/plugins`
- Resolves TS2307 "Cannot find module" errors

### 9. `mobile/tsconfig.json`
- Added `skipLibCheck: true` — suppresses pre-existing node_modules type errors
- Added `esModuleInterop: true` — needed for better-auth default exports

### 10. `backend/lib/auth.ts`
- Extended session `expiresIn` to 30 days (was default 7)
- Added `updateAge: 1 day` — session is refreshed every day to keep it fresh

### 11. `backend/src/db/index.ts`
- Replaced single connection string with `pg.Pool` (max 10 connections)
- Added pool event logging (connect, error, remove)
- Idle timeout: 30s, connection timeout: 5s

## Key Architecture Decisions
- **Token refresh pattern**: axios interceptor (not ElectricSync-level) is the primary refresh mechanism since all API calls go through axios
- **Soft delete on logout**: Preserves DB file for multi-account support; server data is never deleted
- **Navigate to login on refresh failure**: Forces user to re-authenticate before they can logout, preventing accidental data loss
- **30-day session**: Reduces frequency of token expiry while maintaining security

## Files NOT Changed (intentionally)
- `mobile/src/lib/auth-client.ts` — no changes needed
- `mobile/src/features/auth/useAuthStore.ts` — logout flow preserved
- `backend/src/middlewares/authMiddleware.ts` — no changes needed
- `backend/src/routes/electric.ts` — no changes needed

## Deployment
- Backend: push to GitHub → Dokploy auto-rebuilds
- Mobile: `npx expo update --branch production` for OTA update (JS-only changes, no APK rebuild needed)
