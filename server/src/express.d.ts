declare namespace Express {
  interface Request {
    user?: {
      id: number;
      adminId?: number;
      username?: string;
      isSystemAdmin?: boolean;
    };
  }
}
