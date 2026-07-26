import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  sessionId: string;
  organizationId: string;
  laboratoryId: string;
}

export class TokenManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-67890';
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
  }

  public static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
  }

  public static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  public static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }
}
