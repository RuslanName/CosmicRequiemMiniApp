import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    adminId?: number;
    username?: string;
    isSystemAdmin?: boolean;
  };
}
