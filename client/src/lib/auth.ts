import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'anjaneya_secret_key';

export interface AuthUser {
  id: string;
  role: string;
  name: string;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name
    };
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
