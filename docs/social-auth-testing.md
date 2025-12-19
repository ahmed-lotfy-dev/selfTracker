# Social Authentication Testing Guide

This document provides step-by-step instructions for testing the social authentication (OAuth) flow with Google and GitHub in the selfTracker mobile app.

## Prerequisites

> [!IMPORTANT]
> **Development Build Required**: Social login with deep links will NOT work in Expo Go. You must create a development build using `expo run:android` or `expo run:ios`.

### Backend Setup

1. **Environment Variables**: Ensure your backend has valid OAuth credentials:
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

2. **Backend Running**: Start the backend server:
   ```bash
   cd backend
   bun run dev
   ```

3. **OAuth Provider Configuration**:
   - **Google**: Add `selftracker://auth` to authorized redirect URIs in Google Cloud Console
   - **GitHub**: Add `selftracker://auth` to authorization callback URL in GitHub OAuth app settings

4. **Mobile OAuth Redirect (Direct Deep Link)**:
   
   The backend's `/api/social-success` endpoint uses a **direct HTTP redirect** to the deep link:
   
   ```typescript
   app.get("/api/social-success", async (c) => {
     const session = await auth.api.getSession({
       headers: c.req.raw.headers
     });
     const token = session?.session.token;
     
     // Direct redirect to deep link (no HTML page)
     return c.redirect(`selftracker://auth?token=${token || ''}`, 302);
   });
   ```
   
   **Why this approach?**
   - ✅ Zero friction - no intermediate HTML page
   - ✅ Browser automatically follows redirect to deep link
   - ✅ App opens immediately after OAuth
   - ✅ User never sees a "return to app" button
   
   **Important Notes:**
   - The redirect URL must be configured in your OAuth provider settings
   - For production, update `BETTER_AUTH_URL` in backend `.env` to match your domain
   - Example: `BETTER_AUTH_URL=https://selftracker.ahmedlotfy.site`


### Mobile App Setup

1. **Development Build**: Create a dev build (one-time setup):
   ```bash
   cd mobile
   
   # For Android
   bun run android
   
   # For iOS
   bun run ios
   ```

2. **Network Configuration**: Ensure your device/simulator can reach the backend API:
   - For local development, update `API_BASE_URL` in `src/lib/api/config.ts` if needed
   - Your device should be on the same network as your development machine

## Test Cases

### Test 1: Google OAuth Sign In

**Steps:**
1. Open the app on your device/simulator
2. Navigate to the Sign In screen
3. Tap the "Sign in with Google" button
4. **Expected**: Device browser opens with Google OAuth consent screen
5. Select your Google account and authorize the app
6. **Expected**: Browser closes, app reopens automatically
7. **Expected**: User is authenticated and redirected to home screen
8. Verify your profile shows Google account information

**Success Criteria:**
- ✅ Browser opens smoothly
- ✅ OAuth consent screen loads correctly
- ✅ Deep link callback works (app reopens)
- ✅ User is authenticated
- ✅ Navigation to home screen succeeds
- ✅ Session persists after app restart

---

### Test 2: GitHub OAuth Sign In

**Steps:**
1. Log out if already authenticated
2. Navigate to the Sign In screen
3. Tap the "Sign in with GitHub" button
4. **Expected**: Device browser opens with GitHub OAuth authorization screen
5. Authorize the app
6. **Expected**: Browser closes, app reopens automatically
7. **Expected**: User is authenticated and redirected to home screen
8. Verify your profile shows GitHub account information

**Success Criteria:**
- ✅ Browser opens smoothly
- ✅ GitHub authorization screen loads
- ✅ Deep link callback works
- ✅ User is authenticated
- ✅ Navigation succeeds
- ✅ Session persists

---

### Test 3: Sign Up with Social Providers

**Steps:**
1. Ensure you're logged out
2. Navigate to the Sign Up screen
3. Tap either social login button
4. **Expected**: Same OAuth flow as sign-in
5. **Expected**: New account is created if user doesn't exist
6. **Expected**: User is redirected to home screen

**Success Criteria:**
- ✅ Social login buttons visible on sign-up page
- ✅ OAuth flow completes successfully
- ✅ New user account created in database
- ✅ User authenticated and redirected

---

### Test 4: Error Handling - User Cancels OAuth

**Steps:**
1. Navigate to Sign In screen
2. Tap a social login button
3. **When browser opens**: Immediately close it or tap "Cancel"
4. **Expected**: Toast message shows "Sign in cancelled"
5. **Expected**: User remains on sign-in screen
6. **Expected**: Can retry authentication

**Success Criteria:**
- ✅ Graceful handling of cancellation
- ✅ User feedback via toast
- ✅ App remains stable
- ✅ Can retry without issues

---

### Test 5: Network Error Handling

**Steps:**
1. Turn off Wi-Fi/mobile data
2. Tap a social login button
3. **Expected**: Error toast appears
4. Turn network back on
5. Retry authentication
6. **Expected**: OAuth flow works normally

**Success Criteria:**
- ✅ Error displayed to user
- ✅ App doesn't crash
- ✅ Retry works after network restored

---

### Test 6: Deep Link Parsing

**Steps:**
1. Complete a successful OAuth flow
2. Check logs (via `adb logcat` or Xcode console)
3. Look for these log messages:
   - "Deep link event received: selftracker://auth?token=..."
   - "Token extracted from deep link, processing authentication..."
   - "Session established successfully"
   - "Redirecting to home page..."

**Success Criteria:**
- ✅ Deep link URL correctly parsed
- ✅ Token extracted successfully
- ✅ Session established
- ✅ Navigation completed

---

### Test 7: Session Persistence

**Steps:**
1. Authenticate via social login
2. Navigate to home screen
3. Close the app completely
4. Reopen the app
5. **Expected**: User remains authenticated
6. **Expected**: No need to sign in again

**Success Criteria:**
- ✅ Session persists across app restarts
- ✅ Token stored in secure storage
- ✅ User data loads on app launch

---

### Test 8: Concurrent Provider Testing

**Steps:**
1. Sign in with Google
2. Log out
3. Sign in with GitHub
4. Verify different account information displays
5. Log out
6. Sign in with Google again
7. Verify original account information returns

**Success Criteria:**
- ✅ Can switch between providers
- ✅ Correct account loaded each time
- ✅ No data mixing between accounts

## Troubleshooting

### Issue: Browser doesn't open
**Solution**: Ensure `expo-web-browser` is installed and linked properly

### Issue: App doesn't reopen after OAuth
**Solution**: 
- Verify deep link scheme is configured in `app.json`
- Check OAuth redirect URI matches exactly: `selftracker://auth`
- Ensure you're using a development build, not Expo Go

### Issue: "No token received" error
**Solution**:
- Check backend OAuth configuration
- Verify environment variables are set
- Check backend logs for errors

### Issue: Session not persisting
**Solution**:
- Verify `expo-secure-store` is working
- Check that token is being saved
- Ensure `useDeepLinkHandler` is called in root layout

## Manual Verification Checklist

After running all tests:

- [ ] Both Google and GitHub OAuth flows work
- [ ] Deep links correctly redirect to app
- [ ] Tokens are saved to secure storage
- [ ] Session persists across app restarts
- [ ] Error states display user-friendly messages
- [ ] Loading states prevent duplicate requests
- [ ] Social login buttons appear on both sign-in and sign-up pages
- [ ] UI is responsive and looks good
- [ ] No crashes or unexpected behaviors
- [ ] Console logs show proper flow

## Expected OAuth Flow Diagram

```
User taps "Sign in with Google/GitHub"
         ↓
expo-web-browser opens with OAuth URL
         ↓
User authorizes on provider's website
         ↓
Provider redirects to selftracker://auth?token=...
         ↓
Deep link triggers app to reopen
         ↓
useDeepLinkHandler catches the event
         ↓
Token extracted and saved
         ↓
Session established via better-auth
         ↓
React Query cache invalidated
         ↓
User redirected to home screen
         ↓
✅ Authentication complete!
```

## Additional Notes

- **First-time OAuth**: Users may need to create OAuth apps in Google Cloud Console and GitHub
- **Development vs Production**: Update OAuth redirect URIs when deploying to production
- **Security**: Never commit OAuth credentials to version control
- **Deep Link Scheme**: The scheme `selftracker://` must match exactly across `app.json`, OAuth providers, and backend configuration
