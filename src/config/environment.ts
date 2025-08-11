/**
 * 환경별 설정 파일
 */

export type Environment = 'development' | 'staging' | 'production';

const getEnvironment = (): Environment => {
  // __DEV__는 React Native에서 제공하는 개발 모드 플래그입니다
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

const ENVIRONMENT_CONFIG = {
  development: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: true,
  },
  staging: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: false,
  },
  production: {
    API_BASE_URL: 'https://api.busanVibe.site/',
    DEBUG: false,
  },
};

export const ENV = getEnvironment();
export const CONFIG = ENVIRONMENT_CONFIG[ENV];

export default CONFIG;
