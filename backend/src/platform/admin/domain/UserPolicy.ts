export interface UserStatus {
  state: 'Active' | 'Disabled' | 'Locked' | 'Deleted' | 'PasswordExpired';
  isDeactivated: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  passwordExpired: boolean;
  lockRemainingMinutes?: number;
}

export class UserPolicy {
  private static MAX_FAILED_ATTEMPTS = 5;
  private static LOCKOUT_DURATION_MINUTES = 15;
  private static PASSWORD_EXPIRATION_DAYS = 90;

  /**
   * Determines user status state based on database fields.
   */
  static getStatus(user: {
    isDeactivated: boolean;
    lockedUntil?: Date | null;
    deletedAt?: Date | null;
    passwordChangedAt?: Date | null;
    forcePasswordChange?: boolean;
  }): UserStatus {
    const isDeleted = Boolean(user.deletedAt);
    const isDeactivated = Boolean(user.isDeactivated);

    let isLocked = false;
    let lockRemainingMinutes = 0;
    if (user.lockedUntil) {
      const now = new Date();
      const lockUntil = new Date(user.lockedUntil);
      if (lockUntil > now) {
        isLocked = true;
        lockRemainingMinutes = Math.ceil((lockUntil.getTime() - now.getTime()) / (1000 * 60));
      }
    }

    let passwordExpired = Boolean(user.forcePasswordChange);
    if (user.passwordChangedAt && !passwordExpired) {
      const daysSinceChange = (Date.now() - new Date(user.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange >= this.PASSWORD_EXPIRATION_DAYS) {
        passwordExpired = true;
      }
    }

    let state: UserStatus['state'] = 'Active';
    if (isDeleted) state = 'Deleted';
    else if (isDeactivated) state = 'Disabled';
    else if (isLocked) state = 'Locked';
    else if (passwordExpired) state = 'PasswordExpired';

    return {
      state,
      isDeactivated,
      isLocked,
      isDeleted,
      passwordExpired,
      lockRemainingMinutes,
    };
  }

  /**
   * Calculates lockout time after failed login attempt limit reached.
   */
  static calculateLockout(currentAttempts: number): { locked: boolean; newAttempts: number; lockedUntil?: Date } {
    const newAttempts = currentAttempts + 1;
    if (newAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);
      return { locked: true, newAttempts, lockedUntil };
    }
    return { locked: false, newAttempts };
  }
}
