import api from './api';

export interface AdminLoginDto {
  username: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export const adminAuthApi = {
  login: async (data: AdminLoginDto): Promise<LoginResponse> => {
    const response = await api.post('/auth/admin/login', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/admin/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<LoginResponse> => {
    try {
      if (refreshToken) {
        const response = await api.post('/auth/admin/logout', {
          refreshToken,
        });
        return response.data;
      } else {
        const response = await api.post('/auth/admin/logout', {
          refreshToken: '',
        });
        return response.data;
      }
    } catch (error) {
      return { success: true, message: 'Logout successful' };
    }
  },

  getMe: async () => {
    const response = await api.get('/admins/me');
    return response.data;
  },
};

