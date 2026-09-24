import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  generateSalt,
  generateOtpCode,
  sendSignupOtp,
  verifySignupOtp,
  loginWithEmail,
  requestPasswordReset,
  completePasswordReset,
  authenticateWithGoogleAccount,
} from '../src/services/authService';

describe('Colio Authentication Service — Comprehensive Unit Tests', () => {

  describe('1. Cryptographic Security & Password Hashing', () => {
    it('should generate 16-character hex salt', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      assert.strictEqual(salt1.length, 16);
      assert.strictEqual(salt2.length, 16);
      assert.notStrictEqual(salt1, salt2, 'Salts must be randomly generated');
    });

    it('should hash passwords deterministically with the same salt', async () => {
      const salt = 'abcdef1234567890';
      const pass = 'CollegeSecret#2026';
      const hash1 = await hashPassword(pass, salt);
      const hash2 = await hashPassword(pass, salt);
      assert.strictEqual(hash1, hash2, 'Identical password + salt must produce identical hash');
      assert.ok(hash1.length >= 32, 'Hash must be a robust digest string');
    });

    it('should produce different hashes for different salts', async () => {
      const pass = 'CollegeSecret#2026';
      const hash1 = await hashPassword(pass, 'salt_one_1234567');
      const hash2 = await hashPassword(pass, 'salt_two_7654321');
      assert.notStrictEqual(hash1, hash2, 'Different salts must yield different digests');
    });

    it('should produce different hashes for different passwords with the same salt', async () => {
      const salt = generateSalt();
      const hash1 = await hashPassword('password123', salt);
      const hash2 = await hashPassword('password124', salt);
      assert.notStrictEqual(hash1, hash2, 'Different passwords must yield different digests');
    });
  });

  describe('2. 6-Digit Numeric OTP Code Generation', () => {
    it('should generate a 6-digit numeric OTP string', () => {
      for (let i = 0; i < 20; i++) {
        const otp = generateOtpCode();
        assert.match(otp, /^\d{6}$/, `OTP ${otp} must be exactly 6 digits`);
        const num = parseInt(otp, 10);
        assert.ok(num >= 100000 && num <= 999999, 'OTP must be in range 100000 to 999999');
      }
    });
  });

  describe('3. Signup & Email OTP Verification Journey', () => {
    const testEmail = `test.student.${Date.now()}@colio.edu`;
    const testPassword = 'SecureStudentPass2026';
    const testName = 'Colio Test Student';
    let receivedOtp: string;

    it('should validate email format and reject invalid emails', async () => {
      const res = await sendSignupOtp('invalid-email-address', testName, testPassword);
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /valid email/i);
    });

    it('should validate password length and reject short passwords', async () => {
      const res = await sendSignupOtp(testEmail, testName, '123');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /at least 6 characters/i);
    });

    it('should initiate signup and return 6-digit OTP', async () => {
      const res = await sendSignupOtp(testEmail, testName, testPassword);
      assert.strictEqual(res.success, true);
      assert.ok(res.otp);
      assert.match(res.otp, /^\d{6}$/);
      receivedOtp = res.otp;
    });

    it('should reject incorrect verification OTP', async () => {
      const res = await verifySignupOtp(testEmail, '000000');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /invalid verification code/i);
    });

    it('should successfully verify with correct OTP and create user', async () => {
      const res = await verifySignupOtp(testEmail, receivedOtp);
      assert.strictEqual(res.success, true);
      assert.ok(res.user);
      assert.strictEqual(res.user.email, testEmail.toLowerCase());
      assert.strictEqual(res.user.name, testName);
      assert.strictEqual(res.user.isEmailVerified, true);
      assert.strictEqual(res.user.provider, 'password');
    });

    it('should prevent duplicate signup for already registered email', async () => {
      const res = await sendSignupOtp(testEmail, 'Another User', 'Password123');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /already exists/i);
    });
  });

  describe('4. Email & Hashed Password Login Authentication', () => {
    const loginEmail = `login.student.${Date.now()}@colio.edu`;
    const loginPassword = 'StrongPassword#123';
    const loginName = 'Login Student';

    it('should register student via OTP first', async () => {
      const signupRes = await sendSignupOtp(loginEmail, loginName, loginPassword);
      assert.strictEqual(signupRes.success, true);
      const verifyRes = await verifySignupOtp(loginEmail, signupRes.otp!);
      assert.strictEqual(verifyRes.success, true);
    });

    it('should reject login with wrong password', async () => {
      const res = await loginWithEmail(loginEmail, 'WrongPassword999');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /invalid email or password|incorrect password/i);
    });

    it('should reject login for non-existent email', async () => {
      const res = await loginWithEmail('nonexistent.user.999@colio.edu', 'AnyPassword123');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /invalid email or password|no account found/i);
    });

    it('should successfully authenticate with valid credentials', async () => {
      const res = await loginWithEmail(loginEmail, loginPassword);
      assert.strictEqual(res.success, true);
      assert.ok(res.user);
      assert.strictEqual(res.user.email, loginEmail.toLowerCase());
      assert.strictEqual(res.user.name, loginName);
    });
  });

  describe('5. Password Recovery & Reset Flow', () => {
    const recoveryEmail = `recovery.student.${Date.now()}@colio.edu`;
    const initialPass = 'OldPass123456';
    const updatedPass = 'NewBrandPass2026';
    let recoveryToken: string;

    it('should setup account for recovery testing', async () => {
      const s = await sendSignupOtp(recoveryEmail, 'Recovery Student', initialPass);
      await verifySignupOtp(recoveryEmail, s.otp!);
    });

    it('should reject reset request for unregistered email', async () => {
      const res = await requestPasswordReset('unknown.student@colio.edu');
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /no account/i);
    });

    it('should send 6-digit recovery code for registered user', async () => {
      const res = await requestPasswordReset(recoveryEmail);
      assert.strictEqual(res.success, true);
      assert.ok(res.resetCode);
      assert.match(res.resetCode, /^\d{6}$/);
      recoveryToken = res.resetCode;
    });

    it('should reject reset with wrong code', async () => {
      const res = await completePasswordReset(recoveryEmail, '999999', updatedPass);
      assert.strictEqual(res.success, false);
      assert.match(res.error || '', /invalid reset code/i);
    });

    it('should complete password reset with valid code and new password', async () => {
      const res = await completePasswordReset(recoveryEmail, recoveryToken, updatedPass);
      assert.strictEqual(res.success, true);
    });

    it('should now allow login with the new password and reject old password', async () => {
      const oldLogin = await loginWithEmail(recoveryEmail, initialPass);
      assert.strictEqual(oldLogin.success, false, 'Old password must be invalidated');

      const newLogin = await loginWithEmail(recoveryEmail, updatedPass);
      assert.strictEqual(newLogin.success, true, 'New password must authenticate successfully');
    });
  });

  describe('6. Google Unified Sign-In & Automatic Account Creation', () => {
    const googleEmail = `google.user.${Date.now()}@gmail.com`;
    const googleName = 'Google User';

    it('should automatically create account and log in if account is new', async () => {
      const res = await authenticateWithGoogleAccount({
        email: googleEmail,
        name: googleName,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isNewUser, true, 'First Google login must be marked as isNewUser');
      assert.ok(res.user);
      assert.strictEqual(res.user.email, googleEmail);
      assert.strictEqual(res.user.provider, 'google');
      assert.strictEqual(res.user.isEmailVerified, true);
    });

    it('should log into existing account on subsequent Google sign-ins', async () => {
      const res = await authenticateWithGoogleAccount({
        email: googleEmail,
        name: googleName,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isNewUser, false, 'Subsequent Google login should log into existing account');
      assert.ok(res.user);
      assert.strictEqual(res.user.email, googleEmail);
    });
  });

  after(() => {
    setTimeout(() => process.exit(0), 100);
  });

});
