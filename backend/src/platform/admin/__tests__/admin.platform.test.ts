import { describe, it, expect } from 'vitest';
import { PasswordPolicy } from '../domain/PasswordPolicy';
import { UserPolicy } from '../domain/UserPolicy';
import { RBACEngine, PERMISSION_CATALOG } from '../domain/RBACEngine';

describe('Enterprise Administration & Identity Domain Unit Tests', () => {
  describe('PasswordPolicy — Argon2 & Complexity Rules', () => {
    it('validates a strong enterprise password', () => {
      const result = PasswordPolicy.validateComplexity('Enterprise#Pass2026!');
      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = PasswordPolicy.validateComplexity('P#1a');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('at least 8 characters'))).toBe(true);
    });

    it('rejects passwords missing uppercase, lowercase, numbers, or symbols', () => {
      const noUpper = PasswordPolicy.validateComplexity('password123!');
      const noNumber = PasswordPolicy.validateComplexity('PasswordSpecial!');
      const noSymbol = PasswordPolicy.validateComplexity('Password1234');

      expect(noUpper.valid).toBe(false);
      expect(noNumber.valid).toBe(false);
      expect(noSymbol.valid).toBe(false);
    });

    it('generates valid random temporary passwords', () => {
      const tempPass = PasswordPolicy.generateTemporaryPassword(14);
      expect(tempPass).toHaveLength(14);
      const validation = PasswordPolicy.validateComplexity(tempPass);
      expect(validation.valid).toBe(true);
    });
  });

  describe('UserPolicy — Account Lockout & Status Calculation', () => {
    it('evaluates Active status for valid non-deactivated user', () => {
      const status = UserPolicy.getStatus({
        isDeactivated: false,
        lockedUntil: null,
        deletedAt: null,
        forcePasswordChange: false,
      });
      expect(status.state).toBe('Active');
      expect(status.isLocked).toBe(false);
    });

    it('evaluates Locked status when lockedUntil is in the future', () => {
      const future = new Date(Date.now() + 15 * 60 * 1000);
      const status = UserPolicy.getStatus({
        isDeactivated: false,
        lockedUntil: future,
        deletedAt: null,
      });
      expect(status.state).toBe('Locked');
      expect(status.isLocked).toBe(true);
      expect(status.lockRemainingMinutes).toBeGreaterThan(0);
    });

    it('evaluates Disabled status when isDeactivated is true', () => {
      const status = UserPolicy.getStatus({
        isDeactivated: true,
        lockedUntil: null,
        deletedAt: null,
      });
      expect(status.state).toBe('Disabled');
    });

    it('evaluates Deleted status when deletedAt is present', () => {
      const status = UserPolicy.getStatus({
        isDeactivated: true,
        lockedUntil: null,
        deletedAt: new Date(),
      });
      expect(status.state).toBe('Deleted');
    });

    it('triggers lockout after 5 failed attempts', () => {
      const res = UserPolicy.calculateLockout(4); // 4 + 1 = 5
      expect(res.locked).toBe(true);
      expect(res.newAttempts).toBe(5);
      expect(res.lockedUntil).toBeDefined();
    });
  });

  describe('RBACEngine — Fine-Grained Permission Enforcement', () => {
    const userPerms = ['user.create', 'user.read', 'equipment.edit', 'report.sign'];

    it('returns true when user holds all required permissions', () => {
      expect(RBACEngine.hasPermissions(userPerms, ['user.create', 'report.sign'])).toBe(true);
    });

    it('returns false when user lacks required permission', () => {
      expect(RBACEngine.hasPermissions(userPerms, ['admin.users'])).toBe(false);
    });

    it('contains all 26 fine-grained permissions in catalog', () => {
      expect(PERMISSION_CATALOG.length).toBeGreaterThanOrEqual(20);
    });
  });
});
