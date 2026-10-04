# CampusOS — High-Priority Fixes Log

_Last Updated: October 5, 2026_  
_TypeScript Check: **0 errors** ✅_  
_Unit Tests: **71/71 passing** ✅_

---

## 🚨 Critical Fix: Google Sign-In `Error 400: unsupported_response_type`

### 1. Root Cause
In `AuthScreen.tsx`, `responseType: 'id_token'` was previously configured in `Google.useAuthRequest(...)`:
```typescript
// ❌ BROKEN
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: WEB_CLIENT_ID,
  webClientId: WEB_CLIENT_ID,
  androidClientId: ANDROID_CLIENT_ID,
  responseType: 'id_token', // 🚨 Triggered Error 400 on Google's Android OAuth endpoint
  selectAccount: true,
  scopes: ['profile', 'email'],
});
```
Google OAuth 2.0 does not allow the Implicit flow (`response_type=id_token`) on Android/Installed application client IDs (`flowName=GeneralOAuthFlow`). Google rejects it immediately with **`Error 400: unsupported_response_type`**.

### 2. Solution Implemented
In [`src/screens/AuthScreen.tsx`](file:///d:/1.%20PROGRAMING%20WORKSPACE/1.Projects/100%20Days%20of%20Projects/72.CampusOS/src/screens/AuthScreen.tsx):
1. **Removed `responseType: 'id_token'`**:
   `expo-auth-session` automatically uses the standard `ResponseType.Code` on native Android/iOS.
2. **Added `'openid'` to scopes**:
   `scopes: ['openid', 'profile', 'email']` ensures Google returns an `id_token` during PKCE token exchange.
3. **PKCE Auto-Exchange**:
   When the user logs in via Google, `expo-auth-session` exchanges the authorization code with Google's token endpoint via PKCE and retrieves the `idToken` to pass to Firebase's `signInWithCredential`.
4. **Resolved Race Condition**:
   Guarded the response handler to avoid displaying "token not found" while the background code exchange is running.

```typescript
// ✅ FIXED (in src/screens/AuthScreen.tsx)
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: WEB_CLIENT_ID,
  webClientId: WEB_CLIENT_ID,
  androidClientId: ANDROID_CLIENT_ID,
  selectAccount: true,
  scopes: ['openid', 'profile', 'email'],
});
```

---

## 📋 Comprehensive Fixes Registry

| # | Fix | Status | File(s) |
|---|---|---|---|
| 1 | Fix Google Sign-In `unsupported_response_type` (switch to Auth Code flow with PKCE) | ✅ **DONE** | `src/screens/AuthScreen.tsx` |
| 2 | Remove OTP / resetCode from return values & console.logs | ✅ **DONE** | `src/services/authService.ts` |
| 3 | Remove hardcoded dev email backdoor | ✅ **DONE** | `src/services/authService.ts` |
| 4 | Use cryptographically secure RNG for salt & OTP | ✅ **DONE** | `src/services/authService.ts` |
| 5 | Move Firebase config to `.env` / env vars | ✅ **DONE** | `src/services/firebase.ts`, `.env`, `.env.example` |
| 6 | Fix hardcoded month strings in expenses calculation | ✅ **DONE** | `src/context/CampusContext.tsx`, `src/screens/ExpensesScreen.tsx` |
| 7 | Fix cloud sync to use Auth UID instead of roll number | ✅ **DONE** | `src/context/CampusContext.tsx` |
| 8 | Add attendance logs to cloud sync payload | ✅ **DONE** | `src/context/CampusContext.tsx` |
| 9 | Fix Reset All Data to clear auth + re-trigger onboarding | ✅ **DONE** | `src/context/CampusContext.tsx` |
| 10 | Fix `isLoading` initial state (`true` before storage load) | ✅ **DONE** | `src/context/CampusContext.tsx` |
| 11 | Purge all keys in `resetAllData` (attendance logs, legacy auth keys) | ✅ **DONE** | `src/context/CampusContext.tsx` |

---

## 🚀 How to Build a Fresh APK

To generate an updated preview APK with the Google OAuth fix:
```bash
npm run build:apk
```
Or for production release:
```bash
npm run build:apk:prod
```
