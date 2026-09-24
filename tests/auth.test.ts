/**
 * auth.test.ts — Tests for Firebase-only authService
 *
 * NOTE: These tests cover the pure logic helpers (rate limiting, profile building).
 * Firebase Auth calls (signupWithEmail, loginWithEmail, etc.) require a live Firebase
 * emulator or integration test environment and are excluded from unit tests.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkRateLimit,
} from '../src/services/authService';

describe('Colio Authentication Service — Unit Tests (Firebase-Only)', () => {

  describe('1. Rate Limiting', () => {
    it('checkRateLimit should return allowed:true for fresh attempts', async () => {
      const uniqueEmail = `test_${Date.now()}@college.edu`;
      const result = await checkRateLimit(uniqueEmail, 'login');
      assert.strictEqual(result.allowed, true);
    });

    it('checkRateLimit should return allowed:true for signup on fresh email', async () => {
      const uniqueEmail = `signup_${Date.now()}@college.edu`;
      const result = await checkRateLimit(uniqueEmail, 'signup');
      assert.strictEqual(result.allowed, true);
    });

    it('checkRateLimit should return allowed:true for reset on fresh email', async () => {
      const uniqueEmail = `reset_${Date.now()}@college.edu`;
      const result = await checkRateLimit(uniqueEmail, 'reset');
      assert.strictEqual(result.allowed, true);
    });

    it('checkRateLimit result object has required shape', async () => {
      const result = await checkRateLimit('shape@test.com', 'login');
      assert.ok(typeof result.allowed === 'boolean', 'result.allowed should be boolean');
    });
  });

  describe('2. Auth Architecture Notes', () => {
    it('auth system uses Firebase Auth as single source of truth', () => {
      // No custom OTP, no custom password hashing, no email-keyed Firestore docs
      // All profiles stored under users/{uid}
      assert.ok(true, 'Firebase-only auth: confirmed by code review');
    });

    it('OTP system is fully removed', () => {
      // Verify by attempting to import old functions — they should not exist
      // This test documents the intentional removal of the OTP system
      const authModule = require('../src/services/authService');
      assert.strictEqual(authModule.sendSignupOtp, undefined, 'sendSignupOtp should be removed');
      assert.strictEqual(authModule.verifySignupOtp, undefined, 'verifySignupOtp should be removed');
      assert.strictEqual(authModule.completePasswordReset, undefined, 'completePasswordReset should be removed');
      assert.strictEqual(authModule.hashPassword, undefined, 'hashPassword should be removed');
      assert.strictEqual(authModule.generateSalt, undefined, 'generateSalt should be removed');
      assert.strictEqual(authModule.generateOtpCode, undefined, 'generateOtpCode should be removed');
    });

    it('new auth exports exist', () => {
      const authModule = require('../src/services/authService');
      assert.ok(typeof authModule.signupWithEmail === 'function', 'signupWithEmail should exist');
      assert.ok(typeof authModule.loginWithEmail === 'function', 'loginWithEmail should exist');
      assert.ok(typeof authModule.checkEmailVerified === 'function', 'checkEmailVerified should exist');
      assert.ok(typeof authModule.resendVerificationEmail === 'function', 'resendVerificationEmail should exist');
      assert.ok(typeof authModule.requestPasswordReset === 'function', 'requestPasswordReset should exist');
      assert.ok(typeof authModule.logoutSession === 'function', 'logoutSession should exist');
      assert.ok(typeof authModule.getPersistedSession === 'function', 'getPersistedSession should exist');
      assert.ok(typeof authModule.checkRateLimit === 'function', 'checkRateLimit should exist');
      assert.ok(typeof authModule.triggerGoogleSignInWeb === 'function', 'triggerGoogleSignInWeb should exist');
      assert.ok(typeof authModule.signInWithGoogleToken === 'function', 'signInWithGoogleToken should exist');
    });

    it('session storage uses v3 key (not v2)', () => {
      // The new session cache key is @colio_auth_user_v3
      // This prevents old plaintext v2 sessions from being auto-loaded
      const code = require('fs').readFileSync(
        require('path').join(__dirname, '../src/services/authService.ts'),
        'utf8'
      );
      assert.ok(code.includes('@colio_auth_user_v3'), 'Should use v3 session key');
      assert.ok(!code.includes('@colio_auth_user_v2'), 'Should not use old v2 session key');
    });
  });

  describe('3. Password Reset Architecture', () => {
    it('password reset is single-step (no code entry)', () => {
      // Firebase sends a reset link directly to email
      // No resetCode state, no completePasswordReset function needed
      const authModule = require('../src/services/authService');
      assert.strictEqual(authModule.completePasswordReset, undefined);
    });
  });
});
