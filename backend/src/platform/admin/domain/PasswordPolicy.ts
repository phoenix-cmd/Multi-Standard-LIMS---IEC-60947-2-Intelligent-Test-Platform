import bcrypt from 'bcryptjs';

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0..100
  errors: string[];
}

export class PasswordPolicy {
  private static MIN_LENGTH = 8;
  private static MAX_HISTORY = 3;

  /**
   * Validates password complexity against enterprise rules.
   */
  static validateComplexity(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long.`);
    } else {
      score += 25;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z).');
    } else {
      score += 25;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z).');
    } else {
      score += 25;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9).');
    } else {
      score += 15;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*).');
    } else {
      score += 10;
    }

    return {
      valid: errors.length === 0,
      score,
      errors,
    };
  }

  /**
   * Checks if candidate password matches any hash in previous password history.
   */
  static async isReusedInHistory(candidatePassword: string, previousHashes: string[]): Promise<boolean> {
    const historyToCheck = previousHashes.slice(0, this.MAX_HISTORY);
    for (const hash of historyToCheck) {
      const match = await bcrypt.compare(candidatePassword, hash);
      if (match) return true;
    }
    return false;
  }

  /**
   * Hashes a password using secure salt rounds.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares candidate password with stored hash.
   */
  static async comparePassword(candidate: string, hash: string): Promise<boolean> {
    return bcrypt.compare(candidate, hash);
  }

  /**
   * Generates a secure random temporary password.
   */
  static generateTemporaryPassword(length = 12): string {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';

    let pass = '';
    pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
    pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const all = uppers + lowers + numbers + symbols;
    for (let i = 4; i < length; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }

    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  }
}
