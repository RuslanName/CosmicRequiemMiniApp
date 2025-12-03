import { ENV } from './constants';

export const redisConfig = {
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
};

export const redisOptions = {
  password: redisConfig.password || undefined,
  maxRetriesPerRequest: ENV.REDIS_MAX_RETRIES_PER_REQUEST,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: ENV.REDIS_CONNECT_TIMEOUT,
  commandTimeout: ENV.REDIS_COMMAND_TIMEOUT,
  keepAlive: ENV.REDIS_KEEP_ALIVE,
  enableOfflineQueue: false,
  lazyConnect: false,
  enableReadyCheck: true,
  maxLoadingTimeout: ENV.REDIS_MAX_LOADING_TIMEOUT,
};
