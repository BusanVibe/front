/**
 * 환경별 설정 파일
 */

export type Environment = 'development' | 'staging' | 'production';

const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

const ENVIRONMENT_CONFIG = {
  development: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: true,
    KAKAO_CLIENT_ID: '54690ce439aabad65181d8b39262d8b9',
  },
  staging: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: false,
    KAKAO_CLIENT_ID: '54690ce439aabad65181d8b39262d8b9',
  },
  production: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: false,
    KAKAO_CLIENT_ID: '54690ce439aabad65181d8b39262d8b9',
  },
};

export const ENV = getEnvironment();
export const CONFIG = ENVIRONMENT_CONFIG[ENV];

export default CONFIG;
