import { getAllowedHosts } from './origin.config';

const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    const apiHost = hostname.replace('admin.', 'api.');
    return `${protocol}//${apiHost}`;
  }
  
  return 'http://localhost:5000';
};

export const ENV = {
  API_URL: getApiUrl(),
  ALLOWED_HOSTS: getAllowedHosts(import.meta.env.VITE_ALLOWED_HOSTS),
  DEV_SERVER_HOST: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
  DEV_SERVER_PORT: import.meta.env.VITE_DEV_SERVER_PORT || '5173',
  BASE_URL: import.meta.env.BASE_URL || '/',
} as const;

